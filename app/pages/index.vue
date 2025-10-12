<template>
  <div class="p-10">
    <h1 class="text-3xl font-bold mb-6">🌙 Liste des Cagnottes</h1>

    <div v-if="pending" class="text-gray-500">Chargement en cours...</div>
    <div v-else-if="error" class="text-red-500 bg-red-100 p-4 rounded">
      Erreur: {{ error.message }}
    </div>

    <ul v-else-if="cagnottes && cagnottes.length > 0">
      <li v-for="c in cagnottes" :key="c.id" class="border rounded-lg p-4 mb-2 hover:bg-gray-100 transition">
        <h2 class="font-semibold text-lg">{{ c.titre }}</h2>
        <p class="text-gray-600">{{ c.description }}</p>
        <a :href="c.lien" target="_blank" class="text-blue-500 underline mt-2 inline-block">
          Voir la cagnotte
        </a>
      </li>
    </ul>
    
    <div v-else class="text-gray-500">
      Aucune cagnotte trouvée.
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: cagnottes, error, pending } = await useFetch('/api/cagnottes')
</script>