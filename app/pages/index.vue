<template>
  <div class="p-10 bg-gray-50 min-h-screen">
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">
      🌙 Liste des Cagnottes
    </h1>

    <!-- Loading -->
    <div v-if="pending" class="text-gray-500 text-center py-10">
      Chargement en cours...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-red-500 bg-red-100 p-4 rounded text-center">
      Erreur : {{ error.message }}
    </div>

    <!-- Liste des cagnottes -->
    <div
      v-else-if="cagnottes && cagnottes.length > 0"
      class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="c in cagnottes"
        :key="c.id"
        class="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
      >
        <!-- Image -->
        <img
          v-if="c.image"
          :src="c.image"
          :alt="c.titre"
          class="w-full h-48 object-cover"
        />
        <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
          🖼️ Aucune image
        </div>

        <!-- Contenu -->
        <div class="p-4 flex flex-col flex-grow">
          <h2 class="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
            {{ c.titre }}
          </h2>

          <p v-if="c.description" class="text-gray-600 text-sm line-clamp-3 mb-3">
            {{ c.description }}
          </p>

          <div class="mt-auto text-sm text-gray-500">
            <div v-if="c.category" class="inline-block px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs mr-2">
              {{ c.category }}
            </div>
            <div v-if="c.status" class="inline-block px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs mr-2">
              {{ c.status }}
            </div>
            <div v-if="c.platform" class="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              {{ c.platform }}
            </div>
          </div>

          <p v-if="c.start_date" class="text-gray-400 text-xs mt-2">
            🗓️ Lancée le {{ formatDate(c.start_date) }}
          </p>

          <a
            :href="c.lien"
            target="_blank"
            class="mt-4 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Voir la cagnotte
          </a>
        </div>
      </div>
    </div>

    <!-- Aucun résultat -->
    <div v-else class="text-gray-500 text-center py-10">
      Aucune cagnotte trouvée.
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: cagnottes, error, pending } = await useFetch('/api/cagnottes')

// petite fonction utilitaire pour formater les dates joliment
const formatDate = (date: string | Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
