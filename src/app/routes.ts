import { createBrowserRouter } from "react-router";
import Root from "./Root";
import OverviewPage from "./pages/OverviewPage";
import LodgingPage from "./pages/LodgingPage";
import ItineraryPage from "./pages/ItineraryPage";
import FullItineraryPage from "./pages/FullItineraryPage";
import NowPage from "./pages/NowPage";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: Root,
      children: [
        { index: true, Component: OverviewPage },
        { path: "lodging", Component: LodgingPage },
        { path: "itinerary", Component: ItineraryPage },
        { path: "full-itinerary", Component: FullItineraryPage },
        { path: "now", Component: NowPage },
      ],
    },
  ],
  {
    basename: "/cali-trip",
  }
);
