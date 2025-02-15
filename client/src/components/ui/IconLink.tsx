import { Link as RouterLink } from "react-router-dom";
interface IconLinkProps {
    text?: string;
    to: string;
    icon: React.ReactNode;
    className?: string;
  }


export default function IconLink({ text, to, icon, className }: IconLinkProps) {
    return (
      <RouterLink
        to={to}
        className={"flex items-center gap-2 p-1 rounded-md " + (text ? "rounded-full justify-center " : '') + (className ?? '')}
      >
        <div className="flex gap-2 items-center">
          {icon}
          {text && <p>{text}</p>}
        </div>
      </RouterLink>
    );
  }