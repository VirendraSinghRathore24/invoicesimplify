export const Header = () => (
  <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">
    <a href="/" className="text-2xl font-bold text-indigo-600 dark:text-white">
      InvoiceSimplify
    </a>
    <a
      href="/create-invoice"
      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
    >
      Create Invoice
    </a>
  </header>
);
