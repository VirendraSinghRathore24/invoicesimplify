import { Plus, Minus } from "lucide-react";

const FAQItem = ({ q, a, isOpen, onClick }) => {
  return (
    <div
      className={`group border-b border-slate-200/60 transition-all duration-500 ${
        isOpen ? "bg-blue-50/30" : "bg-transparent"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full py-7 px-4 flex items-center justify-between text-left transition-all hover:px-6"
      >
        <span
          className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
            isOpen ? "text-blue-600" : "text-slate-900"
          }`}
        >
          {q}
        </span>
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ${
            isOpen ? "bg-blue-600 rotate-180" : "bg-slate-100 rotate-0"
          }`}
        >
          {isOpen ? (
            <Minus size={18} className="text-white" />
          ) : (
            <Plus size={18} className="text-slate-500" />
          )}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-6 pb-8 text-slate-600 leading-relaxed max-w-3xl">
          {a}
        </p>
      </div>
    </div>
  );
};
export default FAQItem;
