import { headers } from "next/headers";
import LinkButton from "./LinkButton";
import Button from "./Button";

const navStructure: Record<string, string> = {
  "/": "Home",
  "/vlogs": "Vlogs",
  "/vlogs/new": "Record a new Vlog",
};

export default function NavSection({
  structureOverride = {},
}: {
  structureOverride?: Record<string, string>;
}) {
  const headersList = headers();
  const currentUrl = headersList.get("x-path");
  const partParts = currentUrl?.split("/");

  // console.log({ currentUrl });
  // console.log("structureOverride", structureOverride);
  let path = "";
  let fullPath = "";
  const navItems = partParts?.map((part, index) => {
    fullPath += part && index === 1 ? `${part}` : `/${part}`;
    const partName = structureOverride[fullPath] ?? navStructure[fullPath];
    // console.log(index, fullPath, path);
    if (index === partParts.length - 1) {
      return <Button key={`nav-${index}`}>{partName}</Button>;
    }
    return (
      <LinkButton key={`nav-${index}`} arrow="right" href={fullPath}>
        {partName}
      </LinkButton>
    );
  });

  return <div className="w-full flex flex-row gap-4">{navItems}</div>;
}
