const { createApp } = Vue;

createApp({
  data() {
    return {
      selectedProfessions: [],
      weeks: [25, 26, 27, 28],
      workers: []
    };
  },
  computed: {
    filteredWorkers() {
      if (this.selectedProfessions.length === 0) return this.workers;
      return this.workers.filter(worker =>
        this.selectedProfessions.includes(worker.profession)
      );
    }
  },
  methods: {
    async fetchBookings() {
      try {
        const response = await fetch('https://yrgo-web-services.netlify.app/bookings');
        const data = await response.json();

        const grouped = {};

        data.forEach(entry => {
          const { name, profession, week, status } = entry;
          if (!grouped[name]) {
            grouped[name] = {
              name,
              profession,
              schedule: {}
            };
          }
          grouped[name].schedule[week] = status;
        });

        this.workers = Object.values(grouped);
      } catch (error) {
        console.error('Failed to load bookings:', error);
      }
    }
  },
  mounted() {
    this.fetchBookings();
  }
}).mount("#app");
