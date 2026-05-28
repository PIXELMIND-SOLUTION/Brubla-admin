import React, { useState, useEffect } from "react";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const Dashboard = () => {

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });

  useEffect(() => {

    // Simulated API Fetch
    setTimeout(() => {

      setStats({
        totalUsers: 1250,
        totalOrders: 3847,
        totalRevenue: 125430,
        activeUsers: 342,
      });

    }, 800);

  }, []);

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users size={22} />,
      growth: "+12.5%",
      positive: true,
      gradient: "from-fuchsia-500 to-purple-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingCart size={22} />,
      growth: "+8.2%",
      positive: true,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign size={22} />,
      growth: "+18.4%",
      positive: true,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: <Activity size={22} />,
      growth: "-2.1%",
      positive: false,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div
      className="
        min-h-screen
        p-6 md:p-8
        text-white
      "
      style={{
        background:
          "linear-gradient(135deg, #020617 0%, #030b2e 45%, #050f3d 100%)",
      }}
    >

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Dashboard Analytics
        </h1>

        <p className="text-slate-400 mt-2">
          Welcome back 👋 Here's what's happening today.
        </p>

      </div>

      {/* Stats Grid */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-6
        "
      >

        {cards.map((card, idx) => (

          <div
            key={idx}
            className="
              relative
              overflow-hidden
              rounded-3xl
              border border-white/10
              bg-white/[0.04]
              backdrop-blur-xl
              p-6
              transition-all duration-300
              hover:scale-[1.02]
              hover:border-white/20
              hover:shadow-[0_10px_40px_rgba(0,0,0,0.35)]
            "
          >

            {/* Glow */}
            <div
              className={`
                absolute -top-10 -right-10
                w-32 h-32 rounded-full blur-3xl opacity-20
                bg-gradient-to-br ${card.gradient}
              `}
            />

            {/* Top */}
            <div className="flex items-center justify-between relative z-10">

              <div
                className={`
                  w-12 h-12 rounded-2xl
                  bg-gradient-to-br ${card.gradient}
                  flex items-center justify-center
                  shadow-lg
                `}
              >
                {card.icon}
              </div>

              <div
                className={`
                  flex items-center gap-1
                  text-xs font-bold px-2 py-1 rounded-lg
                  ${
                    card.positive
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }
                `}
              >

                {card.positive ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}

                {card.growth}

              </div>

            </div>

            {/* Content */}
            <div className="mt-6 relative z-10">

              <h3 className="text-slate-400 text-sm font-medium">
                {card.title}
              </h3>

              <p className="text-4xl font-black mt-2 tracking-tight">
                {card.value}
              </p>

            </div>

          </div>

        ))}

      </div>

      {/* Bottom Grid */}
      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-3
          gap-6
          mt-8
        "
      >

        {/* Chart Placeholder */}
        <div
          className="
            xl:col-span-2
            rounded-3xl
            border border-white/10
            bg-white/[0.04]
            backdrop-blur-xl
            p-6
          "
        >

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-bold">
                Revenue Overview
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Monthly performance analytics
              </p>
            </div>

            <button
              className="
                px-4 py-2 rounded-xl
                bg-white/5 border border-white/10
                text-sm hover:bg-white/10
                transition-all
              "
            >
              Export
            </button>

          </div>

          {/* Fake Chart */}
          <div className="h-[320px] flex items-end gap-4">

            {[40, 70, 55, 90, 65, 80, 50, 100, 75, 60].map(
              (height, idx) => (

                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2"
                >

                  <div
                    className="
                      w-full rounded-t-2xl
                      bg-gradient-to-t
                      from-fuchsia-500 to-blue-500
                      opacity-90
                    "
                    style={{
                      height: `${height}%`,
                    }}
                  />

                  <span className="text-xs text-slate-500">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"][idx]}
                  </span>

                </div>

              )
            )}

          </div>

        </div>

        {/* Activity */}
        <div
          className="
            rounded-3xl
            border border-white/10
            bg-white/[0.04]
            backdrop-blur-xl
            p-6
          "
        >

          <h2 className="text-xl font-bold mb-6">
            Recent Activity
          </h2>

          <div className="space-y-5">

            {[
              "New order received",
              "User registered",
              "Payment completed",
              "Product updated",
              "Vendor approved",
            ].map((item, idx) => (

              <div
                key={idx}
                className="
                  flex items-center gap-4
                  border-b border-white/5
                  pb-4 last:border-none
                "
              >

                <div
                  className="
                    w-10 h-10 rounded-2xl
                    bg-gradient-to-br
                    from-fuchsia-500/20
                    to-blue-500/20
                    flex items-center justify-center
                    border border-white/10
                  "
                >

                  <Activity
                    size={18}
                    className="text-fuchsia-400"
                  />

                </div>

                <div>

                  <p className="font-medium text-sm">
                    {item}
                  </p>

                  <span className="text-xs text-slate-500">
                    2 mins ago
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;