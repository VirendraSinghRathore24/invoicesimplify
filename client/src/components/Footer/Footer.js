export const Footer = () => (
  <footer className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-6 px-4 text-center border-t border-gray-200 dark:border-gray-700">
    <div className="flex flex-wrap justify-center gap-6 text-sm">
      <a href="/aboutus" className="hover:underline">
        About Us
      </a>
      <a href="/contactus" className="hover:underline">
        Contact Us
      </a>
      <a href="/" className="hover:underline">
        Home
      </a>
    </div>
    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
      © {new Date().getFullYear()} InvoiceSimplify. All rights reserved.
    </div>
  </footer>
);
