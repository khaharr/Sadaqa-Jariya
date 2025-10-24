<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-100 via-green-50 to-gray-200 text-gray-900 relative overflow-hidden">
    <!-- Fond animé -->
    <div class="absolute inset-0 overflow-hidden -z-10">
      <div class="absolute w-96 h-96 bg-green-400/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div class="absolute w-[600px] h-[600px] bg-emerald-300/10 rounded-full blur-3xl bottom-20 right-20 animate-pulse-slow"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-16">

      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-extrabold text-green-800 tracking-tight drop-shadow-lg">
          🌙 Répertoire des Cagnottes
        </h1>
        <p class="text-gray-700 mt-4 text-xl">
          Découvrez et soutenez des <span class="text-green-700 font-semibold">causes inspirantes</span> pour la <span class="font-semibold">Oummah</span>
        </p>
      </div>

      <!-- Filtres -->
      <div class="backdrop-blur-md bg-white/40 rounded-2xl p-6 shadow-lg mb-14 flex flex-col md:flex-row justify-between items-center gap-4 border border-green-200">
        <input 
          v-model="search"
          type="text"
          placeholder="🔍 Rechercher une cagnotte..."
          class="w-full md:w-1/3 px-4 py-3 rounded-full bg-white/70 border border-green-300 placeholder-gray-500 focus:ring-2 focus:ring-green-600 outline-none text-gray-800 transition"
        />
        
        <div class="flex gap-4 flex-wrap justify-center">
          <select v-model="selectedCategory" class="px-4 py-2 rounded-full bg-white/70 border border-green-300 text-gray-800 focus:ring-2 focus:ring-green-600 transition">
            <option value="">Toutes les catégories</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>

          <select v-model="sortBy" class="px-4 py-2 rounded-full bg-white/70 border border-green-300 text-gray-800 focus:ring-2 focus:ring-green-600 transition">
            <option value="recent">Les plus récentes</option>
            <option value="ancien">Les plus anciennes</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-20 text-green-700 animate-pulse">
        Chargement des cagnottes...
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="text-center py-20 text-red-500">
        Erreur : {{ error.message }}
      </div>

      <!-- Liste des cagnottes -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-10 justify-items-center"
      >
        <transition-group name="fade" tag="div" class="contents">
          <div
            v-for="cagnotte in paginatedCagnottes"
            :key="cagnotte.id"
            class="group w-full max-w-sm backdrop-blur-lg bg-white/60 border border-green-700/40 shadow-[5px_5px_0px_#00000030] rounded-2xl overflow-hidden hover:shadow-[8px_8px_0px_#00000050] transform hover:-translate-y-2 transition-all duration-300"
          >
            <img
              :src="cagnotte.image || '/default.jpg'"
              alt="image"
              class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="p-5 flex flex-col justify-between h-60">
              <div>
                <h3 class="font-bold text-lg text-green-900 mb-2 line-clamp-2">{{ cagnotte.titre }}</h3>
                <p class="text-sm text-gray-700 line-clamp-3 mb-4">{{ cagnotte.platform || 'Aucune description disponible.' }}</p>
              </div>

              <div class="flex justify-between items-center mb-3">
                <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {{ cagnotte.status || 'Autre' }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatDate(cagnotte.created_at) }}
                </span>
              </div>

              <a
                :href="cagnotte.lien"
                target="_blank"
                class="block text-center bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-semibold py-2 rounded-full transition-all shadow-md"
              >
                Voir la cagnotte
              </a>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-16 gap-3">
        <button
          @click="page--"
          :disabled="page === 1"
          class="px-4 py-2 rounded-full border border-green-700 text-green-700 hover:bg-green-100 disabled:opacity-40 transition"
        >
          ←
        </button>
        <span class="text-gray-700 font-semibold bg-white/70 px-4 py-2 rounded-full border border-green-300 backdrop-blur-md shadow">
          Page {{ page }} / {{ totalPages }}
        </span>
        <button
          @click="page++"
          :disabled="page === totalPages"
          class="px-4 py-2 rounded-full border border-green-700 text-green-700 hover:bg-green-100 disabled:opacity-40 transition"
        >
          →
        </button>
      </div>

      <!-- Aucune cagnotte -->
      <div v-if="!pending && filteredCagnottes.length === 0" class="text-center mt-16 text-gray-600">
        <p>Aucune cagnotte trouvée 😔</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const { data: cagnottes, error, pending } = await useFetch('/api/cagnottes')

// États
const search = ref('')
const selectedCategory = ref('')
const sortBy = ref('recent')
const page = ref(1)
const perPage = 9

// Catégories
const categories = computed(() =>
  [...new Set((cagnottes.value || []).map(c => c.category).filter(Boolean))]
)

// Filtrage
const filteredCagnottes = computed(() => {
  let result = (cagnottes.value || [])
  if (search.value) {
    result = result.filter(c =>
      c.titre.toLowerCase().includes(search.value.toLowerCase())
    )
  }
  if (selectedCategory.value) {
    result = result.filter(c => c.category === selectedCategory.value)
  }
  result = result.sort((a, b) => {
    if (sortBy.value === 'recent') return new Date(b.created_at) - new Date(a.created_at)
    else return new Date(a.created_at) - new Date(b.created_at)
  })
  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredCagnottes.value.length / perPage))
const paginatedCagnottes = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredCagnottes.value.slice(start, start + perPage)
})

// Format date
const formatDate = (date: string | Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animations fluides */
.fade-enter-active, .fade-leave-active {
  transition: all 0.5s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Pulsation lente pour fond */
@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}
.animate-pulse-slow {
  animation: pulse-slow 6s ease-in-out infinite;
}
</style>
