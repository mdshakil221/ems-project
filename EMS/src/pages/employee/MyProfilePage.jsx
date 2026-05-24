import ProfileSection from "../ProfileSection";
import { useAuth } from "../../context/AuthContext";

export default function MyProfilePage() {
  const { user } = useAuth();
  return (
    <div>
      <h2 style={{ color: "#f1f5f9", marginBottom: "24px" }}>👤 আমার Profile</h2>
      <ProfileSection user={user} />
    </div>
  );
}