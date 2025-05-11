<template>
  <div class="app">
    <Header />
    <FilterPanel />
    <BookingGrid />
  </div>
</template>

<script>
import Header from './components/Header.vue';
import FilterPanel from './components/FilterPanel.vue';
import BookingGrid from './components/BookingGrid.vue';

export default {
  components: {
    Header,
    FilterPanel,
    BookingGrid
  }
};
</script>
