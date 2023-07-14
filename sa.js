// Initialize the selected filter state
let selectedFilters = {
  categories: [],
  wallets: [],
  dates: [],
};

// Event listeners for filter dropdowns
categoryDropdown.addEventListener('change', (event) => {
  selectedFilters.categories = Array.from(event.target.selectedOptions, option => option.value);
  renderFilteredTransactions();
});

walletDropdown.addEventListener('change', (event) => {
  selectedFilters.wallets = Array.from(event.target.selectedOptions, option => option.value);
  renderFilteredTransactions();
});

dateDropdown.addEventListener('change', (event) => {
  selectedFilters.dates = Array.from(event.target.selectedOptions, option => option.value);
  renderFilteredTransactions();
});

// Filter function
function filterTransactions(transactions, filters) {
  return transactions.filter(transaction => {
    const {
      categoryId,
      walletId,
      date
    } = transaction;
    const {
      categories,
      wallets,
      dates
    } = filters;
    return (
      (categories.length === 0 || categories.includes(categoryId)) &&
      (wallets.length === 0 || wallets.includes(walletId)) &&
      (dates.length === 0 || dates.includes(date))
    );
  });
}

// Render filtered transactions
function renderFilteredTransactions() {
  const filteredTransactions = filterTransactions(allTransactions, selectedFilters);
  // Render the filtered transactions on your web page
}
