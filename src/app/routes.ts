import { createBrowserRouter } from "react-router";
import Root from "./Root";
import OverviewPage from "./pages/OverviewPage";
import LodgingPage from "./pages/LodgingPage";
import ItineraryPage from "./pages/ItineraryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: OverviewPage },
      { path: "lodging", Component: LodgingPage },
      { path: "itinerary", Component: ItineraryPage },
    ],
  },
]);
