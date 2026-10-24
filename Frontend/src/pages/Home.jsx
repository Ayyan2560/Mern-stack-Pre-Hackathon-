
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, UserRound, Bell } from "lucide-react";

export default function Home() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <header className="home-header">
        <h2>Connect<span>Hub.</span></h2>

        <nav>
          <button onClick={() => navigate("/profile")}>
            <UserRound size={18} /> Profile
          </button>
          <button onClick={() => navigate("/notifications")}>
            <Bell size={18} /> Notifications
          </button>
          <button className="primary-btn" onClick={() => navigate("/create-post")}>
            <Plus size={18} /> Create Post
          </button>
        </nav>
      </header>

      <main className="home-content">
        <p className="eyebrow">YOUR COMMUNITY, YOUR SPACE</p>
        <h1>Welcome back{user?.name ? `, ${user.name}` : ""}.</h1>
        <p>Discover posts, share your moments, and connect with people.</p>

        <section className="dashboard-grid">
          <article>
            <span>01</span>
            <h3>Explore Posts</h3>
            <p>Discover what the community is sharing.</p>
            <button onClick={() => navigate("/posts")}>Explore →</button>
          </article>

          <article>
            <span>02</span>
            <h3>Your Profile</h3>
            <p>Manage your personal information and picture.</p>
            <button onClick={() => navigate("/profile")}>View Profile →</button>
          </article>

          <article>
            <span>03</span>
            <h3>Create Something</h3>
            <p>Share a new post with the community.</p>
            <button onClick={() => navigate("/create-post")}>Create Post →</button>
          </article>
        </section>
      </main>
    </div>
  );
}
