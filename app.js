const { createApp } = Vue;

createApp({
  data() {
    return {
      bookings: [],
      craftsmen: [],
      currentWeek: 24,
      search: '',
      professions: ['Elektriker', 'Målare', 'VVS', 'Snickare', 'Murare'],
      selectedProfessions: [],
      selectedLoad: [],
      startWeek: '',
      endWeek: '',
    };
  },
  computed: {
    filteredCraftsmen() {
      return this.craftsmen.filter(c => {
        const matchesName = c.name.toLowerCase().includes(this.search.toLowerCase());
        const matchesProfession =
          this.selectedProfessions.length === 0 || this.selectedProfessions.includes(c.profession);
        return matchesName && matchesProfession;
      });
    }
  },
  methods: {
    async fetchData() {
      const res = await fetch('https://yrgo-web-services.netlify.app/bookings');
      this.bookings = await res.json();

      // Dummy profession/phone assignment
      const names = [...new Set(this.bookings.map(b => b.name))];
      this.craftsmen = names.map((name, index) => ({
        name,
        profession: this.professions[index % this.professions.length],
        phone: 'Tel: 070-1111111'
      }));
    },
    getStatusClass(name, week) {
      const entry = this.bookings.find(b => b.name === name && b.week === week);
      if (!entry) return 'available';
      if (entry.type === 'Frånvaro') return 'absent';
      if (entry.type === 'Preliminärt bokad') return 'pending';
      if (entry.type === 'Bokad') {
        return entry.allocation === 50 ? 'booked-50' : 'booked-100';
      }
      return 'available';
    },
    getStatusTooltip(name, week) {
      const entry = this.bookings.find(b => b.name === name && b.week === week);
      if (!entry) return 'Ledig';
      return `${entry.type}, ${entry.allocation}%`;
    },
    getStatusText(name, week) {
      const entry = this.bookings.find(b => b.name === name && b.week === week);
      if (!entry) return 'Ledig';
      return `${entry.allocation}%`;
    },
    nextWeek() {
      this.currentWeek += 1;
    },
    prevWeek() {
      this.currentWeek = Math.max(this.currentWeek - 1, 0);
    }
  },
  mounted() {
    this.fetchData();
  }
}).mount('#app');
