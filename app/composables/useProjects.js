
export const useProjects = () => {
  const ALLOWED_DOMAINS = [
    'helloasso.com',
    'cotizup.com', 
    'lepotcommun.fr',
    'mosqueedesmureaux.com',
    'mosqueederambouillet.fr',
    'mosquee-montigny78.fr',
    'cisqy.com',
    'urlr.me'
  ]

  const projectsData = {
    mosquees: [
      {
        id: 1,
        title: "Construction Mosquée Anhors - Rosny-sur-Seine 78531",
        description: "Projet de construction d'une nouvelle mosquée pour la communauté musulmane de Rosny-sur-Seine 78531",
        goal: 495000,
        current: 259000,
        link: "https://www.helloasso.com/associations/association-anhors/collectes/construction-mosquee-anhors",
        badge: "construction",
        adminUpdate: "Dernière mise à jour: 52% atteint - 259.000€ collectés"
      },
      // ... autres projets
    ],
    // ... autres catégories
  }

  const currentCategory = ref('accueil')
  const currentProject = ref(null)
  const showModal = ref(false)

  const isLinkAllowed = (url) => {
    try {
      const domain = new URL(url).hostname
      return ALLOWED_DOMAINS.some(allowed => domain.includes(allowed))
    } catch (e) {
      return false
    }
  }

  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  const openProjectModal = (project) => {
    if (!isLinkAllowed(project.link)) {
      alert('Lien de sécurité non autorisé')
      return
    }
    currentProject.value = project
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    currentProject.value = null
  }

  return {
    projectsData,
    currentCategory,
    currentProject,
    showModal,
    isLinkAllowed,
    escapeHtml,
    formatCurrency,
    openProjectModal,
    closeModal
  }
}