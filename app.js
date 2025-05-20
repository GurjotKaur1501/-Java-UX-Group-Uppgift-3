const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const allWorkers = ref([]);
    const allBookings = ref([]);
    const allProfessions = ref([]);
    const showExport = ref(false);

    const selectedProfessions = ref([]);
    const selectedScopes = ref(['50', '100']);
    const startDateInput = ref('');
    const endDateInput = ref('');

    const allDates = computed(() => {
      const dates = [];
      for (let i = 0; i < 28; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(new Date(date));
      }
      return dates;
    });

    const filteredDays = computed(() => {
      return allDates.value.filter(date => {
        const start = startDateInput.value ? new Date(startDateInput.value) : null;
        const end = endDateInput.value ? new Date(endDateInput.value) : null;
        return (!start || date >= start) && (!end || date <= end);
      });
    });

    const filteredWorkers = computed(() => {
      return allWorkers.value.filter(w =>
        selectedProfessions.value.length === 0 ||
        w.professions.some(p => selectedProfessions.value.includes(p))
      );
    });

    const filteredBookings = computed(() => {
      return allBookings.value.filter(b => {
        const matchesProfession =
          selectedProfessions.value.length === 0 ||
          b.professions.some(p => selectedProfessions.value.includes(p));
        const matchesScope =
          selectedScopes.value.length === 0 ||
          selectedScopes.value.includes(String(b.percentage));
        const date = new Date(b.date);
        const start = startDateInput.value ? new Date(startDateInput.value) : null;
        const end = endDateInput.value ? new Date(endDateInput.value) : null;
        const matchesDate = (!start || date >= start) && (!end || date <= end);
        return matchesProfession && matchesScope && matchesDate;
      });
    });

    const filteredExported = computed(() => filteredBookings.value);

    function getPercentage(workerId, date) {
      const d = toDateString(date);
      const booking = filteredBookings.value.find(
        b => b.workerId === workerId && b.date === d
      );
      return booking ? `${booking.percentage}%` : '';
    }

    function getCellClass(workerId, date) {
      const d = toDateString(date);
      const booking = filteredBookings.value.find(
        b => b.workerId === workerId && b.date === d
      );
      if (!booking) return 'ledig';
      const { type, percentage } = booking;
      if (type === 'Absent') return 'franvaro';
      if (type === 'Booked') return percentage === 100 ? 'bokad-full' : 'bokad-half';
      if (type === 'Preliminary') return percentage === 100 ? 'prelim-full' : 'prelim-half';
      return 'ledig';
    }

    function toDateString(date) {
      return new Date(date).toISOString().split('T')[0];
    }

    function getWeekday(date) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    }

    function getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    }

    async function fetchData() {
      const res = await fetch('https://yrgo-web-services.netlify.app/bookings');
      const rawData = await res.json();

      const bookings = [];
      const professionsSet = new Set();

      rawData.forEach((worker, workerIndex) => {
        const { name, professions, bookings: workerBookings } = worker;
        professions.forEach(p => professionsSet.add(p));

        workerBookings.forEach(entry => {
          const from = new Date(entry.from);
          const to = new Date(entry.to);
          for (
            let date = new Date(from);
            date <= to;
            date.setDate(date.getDate() + 1)
          ) {
            bookings.push({
              name,
              professions,
              workerId: workerIndex,
              date: toDateString(date),
              type: entry.status,
              percentage: entry.percentage,
            });
          }
        });
      });

      allWorkers.value = rawData.map((w, i) => ({
        id: i,
        name: w.name,
        professions: w.professions,
      }));

      allBookings.value = bookings;
      allProfessions.value = [...professionsSet];
    }

    onMounted(fetchData);

    return {
      allWorkers,
      allProfessions,
      selectedProfessions,
      selectedScopes,
      startDateInput,
      endDateInput,
      filteredDays,
      filteredWorkers,
      getWeekday,
      getWeekNumber,
      getPercentage,
      getCellClass,
      filteredExported,
      showExport,
    };
  }
}).mount('#app');
