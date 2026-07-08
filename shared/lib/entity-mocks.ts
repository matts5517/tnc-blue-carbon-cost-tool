import { genSalt, hash } from "bcrypt";
import { DataSource, DeepPartial } from "typeorm";
import { User } from "@shared/entities/users/user.entity";
import {
  Project,
  PROJECT_PRICE_TYPE,
  PROJECT_SIZE_FILTER,
} from "@shared/entities/projects.entity";
import { Country } from "@shared/entities/country.entity";
import {
  ACTIVITY,
  RESTORATION_ACTIVITY_SUBTYPE,
} from "@shared/entities/activity.enum";
import { ECOSYSTEM } from "@shared/entities/ecosystem.enum";
import { ProjectScorecard } from "@shared/entities/project-scorecard.entity";
import { PROJECT_SCORE } from "@shared/entities/project-score.enum";
import { CustomProject } from "@shared/entities/custom-project.entity";
import { CustomProjectStub } from "@shared/lib/stubs/custom-project.stub";

export const createUser = async (
  dataSource: DataSource,
  additionalData?: Partial<User>,
): Promise<User> => {
  const salt = await genSalt();
  const usedPassword = additionalData?.password ?? "12345678";
  const user = {
    email: "test@user.com",
    ...additionalData,
    password: await hash(usedPassword, salt),
    isActive: additionalData?.isActive ?? true,
  };

  await dataSource.getRepository(User).save(user);
  return { ...user, password: usedPassword } as User;
};

export const createProject = async (
  dataSource: DataSource,
  additionalData?: DeepPartial<Project>,
): Promise<Project> => {
  const countries = await dataSource.getRepository(Country).find();
  if (!countries.length) {
    throw new Error("No countries in the database");
  }
  const defaultProjectData: Partial<Project> = {
    projectName: "Test Project" + Math.random().toString(36).substring(7),
    countryCode: countries[0].code,
    activity: ACTIVITY.CONSERVATION,
    ecosystem: ECOSYSTEM.MANGROVE,
    restorationActivity: RESTORATION_ACTIVITY_SUBTYPE.PLANTING,
    projectSize: 100,
    projectSizeFilter: PROJECT_SIZE_FILTER.LARGE,
    abatementPotential: 100,
    totalCostNPV: 100,
    totalCost: 100,
    costPerTCO2eNPV: 100,
    costPerTCO2e: 100,
    initialPriceAssumption: 100,
    capexNPV: 100,
    capex: 50,
    opexNPV: 100,
    opex: 50,
    priceType: PROJECT_PRICE_TYPE.OPEX_BREAKEVEN,
  };

  return dataSource
    .getRepository(Project)
    .save({ ...defaultProjectData, ...additionalData });
};

export const createProjectScorecard = async (
  dataSource: DataSource,
  additionalData?: DeepPartial<ProjectScorecard>,
): Promise<ProjectScorecard> => {
  const countries = await dataSource.getRepository(Country).find();
  if (!countries.length) {
    throw new Error("No countries in the database");
  }
  const defaultProjectScorecardData: Partial<ProjectScorecard> = {
    countryCode: countries[0].code,
    ecosystem: ECOSYSTEM.MANGROVE,
    financialFeasibility: PROJECT_SCORE.HIGH,
    legalFeasibility: PROJECT_SCORE.LOW,
    implementationFeasibility: PROJECT_SCORE.MEDIUM,
    socialFeasibility: PROJECT_SCORE.HIGH,
    securityRating: PROJECT_SCORE.LOW,
    availabilityOfExperiencedLabor: PROJECT_SCORE.MEDIUM,
    availabilityOfAlternatingFunding: PROJECT_SCORE.HIGH,
    coastalProtectionBenefits: PROJECT_SCORE.LOW,
    biodiversityBenefit: PROJECT_SCORE.HIGH,
  };

  return dataSource
    .getRepository(ProjectScorecard)
    .save({ ...defaultProjectScorecardData, ...additionalData });
};

export const createCustomProject = async (
  dataSource: DataSource,
  additionalData: { user: User } & Partial<CustomProject>,
): Promise<CustomProject> => {
  const countries = await dataSource.getRepository(Country).find();
  if (!countries.length) {
    throw new Error("No countries in the database");
  }

  return dataSource.getRepository(CustomProject).save({
    ...CustomProjectStub.DEFAULT_CONSERVATION_CUSTOM_PROJECT,
    ...additionalData,
  });
};
