import DirectoryPage from "@/components/directory/DirectoryPage";

export const metadata = {
  title: "Businesses — AaramBD",
  description:
    "Browse thousands of registered businesses across Bangladesh. Find shops, stores, and businesses by category and location on AaramBD.",
};

export default function BusinessesPage() {
  return (
    <DirectoryPage
      title="Businesses"
      subtitle="Browse shops and businesses across Bangladesh"
      endpoint="/get_shops_data"
      dataKey="shops_information"
      categoryCountKey="category_count"
    />
  );
}
