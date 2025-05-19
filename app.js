const { createApp } = Vue;

createApp({
  data() {
    return {
      searchQuery: "",
      selectedProfessions: [],
      startDate: "",
      endDate: "",
      extent: null,
      weeks: [25, 26, 27, 28],
      workers: []
    };
  },
  computed: {
    filteredWorkers() {
      return this.workers
        .filter(worker => {
          const matchesSearch = worker.name.toLowerCase().includes(this.searchQuery.toLowerCase());
          const matchesProfession =
            this.selectedProfessions.length === 0 || this.selectedProfessions.includes(worker.profession);
          return matchesSearch && matchesProfession;
        });
    }
  },
  methods: {
    async fetchData() {
      try {
        const res = await fetch("https://yrgo-web-services.netlify.app/bookings");
        const data = await res.json();

        const grouped = {};

        data.forEach(entry => {
          const key = `${entry.name}|${entry.profession}|${entry.phone}`;
          if (!grouped[key]) {
            grouped[key] = {
              name: entry.name,
              profession: entry.profession,
              phone: entry.phone,
              schedule: {}
            };
          }
          const dayKey = `${entry.week}-${entry.day}`;
          grouped[key].schedule[dayKey] = {
            status: entry.status,
            percent: entry.percent
          };
        });

        this.workers = Object.values(grouped);
      } catch (err) {
        console.error("API fetch failed:", err);
      }
    },
    getDayLabel(day) {
      const labels = ["Mån", "Tis", "Ons", "Tors", "Fre", "Lör", "Sön"];
      return labels[day - 1] || "";
    },
    getStatusClass(status) {
      if (!status) return '';
      return {
        ledig: status === 'ledig',
        pending: status === 'pending',
        bokningsbar: status === 'bokningsbar',
        fullbokad: status === 'fullbokad'
      };
    }
  },
  mounted() {
    this.fetchData();
  }
}).mount("#app");
