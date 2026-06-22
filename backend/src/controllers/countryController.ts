import { Request, Response } from "express";
import { countryData } from "../intelligence/countryData";

export const getCountries = (req: Request, res: Response) => {
  res.json({ success: true, count: countryData.length, countries: countryData });
};

export const compareCountries = (req: Request, res: Response) => {
  const { countries } = req.body;

  if (!countries || !Array.isArray(countries)) {
    res.status(400).json({ success: false, message: "Provide an array of country names" });
    return;
  }

  const filtered = countryData.filter((c) => countries.includes(c.country));

  if (filtered.length === 0) {
    res.status(404).json({ success: false, message: "No matching countries found" });
    return;
  }

  res.json({ success: true, comparison: filtered });
};