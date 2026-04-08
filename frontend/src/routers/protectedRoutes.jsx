import Error from "../Error";
import { ViewAuction } from "../pages/ViewAuction";
import { MainLayout } from "../layout/MainLayout";
import { AuctionList } from "../pages/AuctionList";
import { CreateAuction } from "../pages/CreateAuction";
import { MyAuction } from "../pages/MyAuction";
import Profile from "../pages/Profile";
import PublicProfile from "../pages/PublicProfile";
import Privacy from "../pages/Privacy";
import Chat from "../pages/Chat";
import { History } from "../pages/History";
import Notifications from "../pages/Notifications";

export const protectedRoutes = [
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "auction",
        element: <AuctionList />,
        errorElement: <Error />,
      },
      {
        path: "myauction",
        element: <MyAuction />,
        errorElement: <Error />,
      },
      {
        path: "chat",
        element: <Chat />,
        errorElement: <Error />,
      },
      {
        path: "create",
        element: <CreateAuction />,
        errorElement: <Error />,
      },
      {
        path: "auction/:id",
        element: <ViewAuction />,
        errorElement: <Error />,
      },

      {
        path: "profile",
        element: <Profile />,
        errorElement: <Error />,
      },
      {
        path: "profile/:id",
        element: <PublicProfile />,
        errorElement: <Error />,
      },
      {
        path: "privacy",
        element: <Privacy />,
        errorElement: <Error />,
      },
      {
        path: "history",
        element: <History />,
        errorElement: <Error />,
      },
      {
        path: "notifications",
        element: <Notifications />,
        errorElement: <Error />,
      },
    ],
  },
];
