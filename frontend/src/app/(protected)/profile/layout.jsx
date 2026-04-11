import { ProtectedRoute } from "@/components/auth/protected-route";

export const metadata = {
    title: "Profile | interview matrix",
    description: "Manage your profile and settings.",
};
export default function ProfilePage({children}) {
    return (
        <ProtectedRoute>
        {children}
        </ProtectedRoute>
    );
}