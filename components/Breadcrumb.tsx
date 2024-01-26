import { headers } from "next/headers";
import LinkButton from "./LinkButton";
import Button from "./Button";
import Menu, { MenuItem } from "./Menu";

const navStructure: Record<string, string> = {
  "/": "Home",
  "/vlogs": "Vlogs",
  "/vlogs/new": "Record a new Vlog",
};

export default function Breadcrumb({
  structureOverride = {},
}: {
  structureOverride?: Record<string, string>;
}) {
  const headersList = headers();
  const currentUrl = headersList.get("x-path");
  const partParts = currentUrl?.split("/");

  let fullPath = "";
  const items: MenuItem[] = [];
  partParts?.forEach((part, index) => {
    fullPath += part && index === 1 ? `${part}` : `/${part}`;
    const partName = structureOverride[fullPath] ?? navStructure[fullPath];
    if (index === partParts.length - 1) {
      items.push({ text: partName, href: null });
    } else {
      items.push({ text: partName, href: fullPath });
    }
  });

  return (
    <div className="w-full gap-4">
      <Menu items={items} />
    </div>
  );
}
