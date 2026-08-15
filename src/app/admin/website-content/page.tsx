import { prisma } from "@/lib/prisma";
import { ContentEditor } from "./ContentEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Website Content" };

const FIELDS = [
  { key: "home.hero.title", label: "Home Hero Title" },
  { key: "home.hero.subtitle", label: "Home Hero Subtitle" },
  { key: "about.body", label: "About Page Body" },
  { key: "contact.address", label: "Contact Address" },
];

export default async function AdminWebsiteContentPage() {
  const rows = await prisma.websiteContent.findMany();
  const map = new Map(rows.map((r) => [r.key, String(r.value ?? "")]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Website Content</h1>
        <p className="mt-1 text-xs text-aio-silver">
          Editable copy blocks. This is architecture for a lightweight CMS — wire additional pages&apos;
          static copy through WebsiteContent as needed.
        </p>
      </div>
      {FIELDS.map((f) => (
        <ContentEditor key={f.key} contentKey={f.key} label={f.label} value={map.get(f.key) ?? ""} />
      ))}
    </div>
  );
}
