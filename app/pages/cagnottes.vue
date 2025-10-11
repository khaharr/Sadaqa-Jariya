<template>
  <div>
    <Navigation />
    
    <div class="min-h-screen bg-gradient-to-br from-primary to-secondary text-white">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="text-center relative pt-20">
          <div class="w-28 h-28 mx-auto mb-6 text-white">
            <!-- Logo SVG -->
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
              <!-- Même logo SVG -->
            </svg>
          </div>
          
          <h1 class="text-4xl font-bold mb-4 text-shadow-lg">Sadaqah Jariyah</h1>
          
          <div class="bg-white/10 backdrop-blur-sm p-6 rounded-lg border-l-4 border-accent max-w-4xl mx-auto italic">
            « Lorsque la personne meurt, ses actes lui sont coupés à l'exception de trois choses : une aumône continue, une science dont les gens profitent et un enfant pieux qui invoque pour lui. »<br>
            <strong class="not-italic">(Rapporté par Mouslim)</strong>
          </div>
        </header>

        <!-- Navigation par catégories -->
        <div class="flex flex-wrap justify-center gap-4 my-8">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="setCurrentCategory(category.id)"
            class="px-6 py-3 bg-white/10 border-2 border-white/30 rounded-full font-bold transition-all duration-300 hover:bg-white/20 hover:-translate-y-1"
            :class="currentCategory === category.id ? 'bg-white text-primary border-white' : ''"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- Contenu des catégories -->
        <div class="bg-white/95 rounded-2xl p-8 mt-6 min-h-[500px]">
          <component :is="currentComponent" />
        </div>

        <div class="text-center mt-8 text-xl font-bold uppercase tracking-wide">
          "Votre don continue de vous rapporter des récompenses même après votre mort"
        </div>
      </div>
    </div>

    <!-- Modal -->
    <CagnotteModal 
      v-if="showModal && currentProject"
      :project="currentProject"
      @close="closeModal"
    />

    <!-- Notification Bell -->
    <NotificationBell />
  </div>
</template>

<script>

export default defineComponent({
  setup() {
    const {
      currentCategory,
      currentProject,
      showModal,
      closeModal
    } = useProjects()

    const categories = [
      { id: 'accueil', name: 'Accueil' },
      { id: 'mosquees', name: 'Construction Mosquées' },
      { id: 'dons-mensuels', name: 'Dons Mensuels' },
      { id: 'defunt', name: 'Défunt' },
      { id: 'forages', name: 'Forages' },
      { id: 'sante', name: 'Santé' },
      { id: 'orphelin', name: 'Orphelin' },
      { id: 'divers', name: 'Fait divers' },
      { id: 'soutien', name: 'Soutien' }
    ]

    const setCurrentCategory = (category) => {
      currentCategory.value = category
    }

    const currentComponent = computed(() => {
      return defineAsyncComponent(() => 
        import(`@/components/categories/${currentCategory.value}.vue`)
      )
    })

    return {
      categories,
      currentCategory,
      currentProject,
      showModal,
      setCurrentCategory,
      currentComponent,
      closeModal
    }
  }
})
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}
</style>