import { Router } from "express";
import { getCountries, compareCountries } from "../controllers/countryController";

const router = Router();

router.get("/", getCountries);
router.post("/compare", compareCountries);

export default router;