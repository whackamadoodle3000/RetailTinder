import { AuthContext } from "./Auth";
import { Button } from "../inputs/Button";
import { useContext } from "react";
import Link from "next/link";

export function Toolbar() {
  const authContext = useContext(AuthContext);

  return (
    <div className="fixed bottom-0 z-10 flex flex-col w-full bg-neutral-100">
      <div className="flex-grow border-t-2 border-neutral-200"></div>

      <div className="flex justify-around py-2">
        <TabLink href="/explore" label="Explore" />
        <TabLink href="/donate" label="Donate" />
      </div>
{/* 
      <div className="pb-3 pt-4">
        <Button
          className="absolute right-8 w-24 text-center text-sm"
          text="Other"
          onClick={authContext.unauthenticate}
          tooltip="Other"
        />
      </div> */}
    </div>
  );
}

type TabLinkProps = {
  href: string;
  label: string;
};

function TabLink({ href, label }: TabLinkProps) {
  return (
    <Link href={href}>
      <div className="text-gray-600 hover:text-gray-800 cursor-pointer">
        {label}
      </div>
    </Link>
  );
}
