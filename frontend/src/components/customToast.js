import { toast } from "react-hot-toast";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

export const showProfessionalToast = (title, message, type = 'success') => {
  
  const styles = {
    success: {
      // We use text-emerald-500 for the SVG so 'currentColor' picks it up
      waveColor: "text-emerald-500", 
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      titleColor: "text-emerald-700 dark:text-emerald-500",
      Icon: CheckCircle2
    },
    error: {
      waveColor: "text-red-500",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-600 dark:text-red-400",
      titleColor: "text-red-700 dark:text-red-500",
      Icon: AlertCircle
    }
  };

  const theme = styles[type] || styles.success;
  const IconComponent = theme.Icon;

  toast.custom((t) => (
    <div
      className={`
        relative overflow-hidden
        w-[90vw] max-w-[340px] 
        p-3 sm:p-4
        flex items-center gap-3 sm:gap-4 
        rounded-xl
        bg-white border border-zinc-100 shadow-[0_8px_24px_rgba(149,157,165,0.2)]
        dark:bg-zinc-950 dark:border-zinc-800 dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]
        pointer-events-auto
        transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${t.visible 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 -translate-y-8 scale-95"
        }
      `}
    >
      {/* --- THE WAVE FIX --- */}
      {/* 1. 'text-emerald-500' (from theme.waveColor) applies color to the SVG 
          2. 'fill-current' on the path tells it to use that text color
          3. 'opacity-20' makes it subtle 
      */}
      <div className={`absolute -left-[28px] top-6 w-[80px] h-[320px] rotate-90 z-0 pointer-events-none ${theme.waveColor}`}>
        <svg 
            viewBox="0 0 1440 320" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full opacity-20" 
        >
          <path 
            fill="currentColor"
            d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className={`relative z-10 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 ${theme.iconBg}`}>
        <IconComponent className={`size-4 sm:size-5 ${theme.iconColor}`} />
      </div>

      <div className="flex-1 flex flex-col justify-center z-10 gap-0.5 min-w-0">
        <p className={`text-[15px] sm:text-[16px] font-medium leading-tight ${theme.titleColor}`}>
          {title}
        </p>
        <p className="text-xs sm:text-sm font-normal text-zinc-500 dark:text-zinc-400">
          {message}
        </p>
      </div>

      <button
        onClick={() => toast.dismiss(t.id)}
        className="relative z-10 group p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
      >
        <X className="size-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
      </button>

    </div>
  ), {
    position: "top-right",
    duration: 2500,
  });
};