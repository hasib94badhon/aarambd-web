import DirectoryPage from "@/components/directory/DirectoryPage";

export const metadata = {
  title: "Services — AaramBD",
  description:
    "Find skilled service providers across Bangladesh. Electricians, plumbers, doctors, lawyers and more — discover trusted professionals on AaramBD.",
};

export default function ServicesPage() {
  return (
    <DirectoryPage
      title="Services"
      subtitle="Find skilled professionals and service providers across Bangladesh"
      endpoint="/get_service_data"
      dataKey="service_information"
      categoryCountKey="category_count"
    />
  );
}
