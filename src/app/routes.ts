import { createBrowserRouter } from "react-router";
import Root from "./Root";
import OverviewPage from "./pages/OverviewPage";
import LodgingPage from "./pages/LodgingPage";
import ItineraryPage from "./pages/ItineraryPage";
import FullItineraryPage from "./pages/FullItineraryPage";

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
      ],
    },
  ],
  {
    basename: "/cali-trip",
  }
);
