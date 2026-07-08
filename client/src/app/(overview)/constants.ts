import {
  ACTIVITY,
  RESTORATION_ACTIVITY_SUBTYPE,
} from "@shared/entities/activity.enum";
import { ECOSYSTEM } from "@shared/entities/ecosystem.enum";
import {
  COST_TYPE_SELECTOR,
  PROJECT_PRICE_TYPE,
  PROJECT_SIZE_FILTER,
} from "@shared/entities/projects.entity";
import { z } from "zod";

const SUB_ACTIVITIES = RESTORATION_ACTIVITY_SUBTYPE;

export const LAYOUT_TRANSITIONS = {
  duration: 0.4,
  ease: "easeInOut",
};

export const FILTER_KEYS = [
  "keyword",
  "projectSizeFilter",
  "priceType",
  "costRangeSelector",
  "countryCode",
  "ecosystem",
  "activity",
  "restorationActivity",
  "costRange",
  "abatementPotentialRange",
] as const;

export const filtersSchema = z.object({
  [FILTER_KEYS[0]]: z.string().optional(),
  [FILTER_KEYS[1]]: z.array(z.nativeEnum(PROJECT_SIZE_FILTER)),
  [FILTER_KEYS[2]]: z.nativeEnum(PROJECT_PRICE_TYPE),
  [FILTER_KEYS[3]]: z.nativeEnum(COST_TYPE_SELECTOR),
  [FILTER_KEYS[4]]: z.string().optional(),
  [FILTER_KEYS[5]]: z.array(z.nativeEnum(ECOSYSTEM)),
  [FILTER_KEYS[6]]: z.array(z.nativeEnum(ACTIVITY)),
  [FILTER_KEYS[7]]: z.array(z.nativeEnum(SUB_ACTIVITIES)),
  [FILTER_KEYS[8]]: z.array(z.number()),
  [FILTER_KEYS[9]]: z.array(z.number()),
});

export const INITIAL_FILTERS_STATE: z.infer<typeof filtersSchema> = {
  keyword: "",
  projectSizeFilter: [],
  priceType: PROJECT_PRICE_TYPE.OPEX_BREAKEVEN,
  costRangeSelector: COST_TYPE_SELECTOR.NPV,
  countryCode: "",
  ecosystem: [],
  activity: [],
  restorationActivity: [],
  costRange: [],
  abatementPotentialRange: [],
};
