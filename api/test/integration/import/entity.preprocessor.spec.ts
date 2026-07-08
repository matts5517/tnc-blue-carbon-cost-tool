import { RawDataIngestionData } from '@api/modules/import/parser/raw-data-ingestion.type';
import {
  EntityPreprocessor,
  ProjectScoreCardNotFoundError,
} from '@api/modules/import/services/entity.preprocessor';
import {
  ACTIVITY,
  RESTORATION_ACTIVITY_SUBTYPE,
} from '@shared/entities/activity.enum';
import { ECOSYSTEM } from '@shared/entities/ecosystem.enum';
import { PROJECT_PRICE_TYPE } from '@shared/entities/projects.entity';
import { TestManager } from 'api/test/utils/test-manager';

// TODO: Entity preprocessor test suite only tests the creation of project dtos which now has been moved outside of it.
//       We need to add tests to other entities

describe('Entity Preprocessor', () => {
  let testManager: TestManager;

  beforeAll(async () => {
    testManager = await TestManager.createTestManager();
  });

  afterEach(async () => {
    await testManager.clearDatabase();
  });

  afterAll(async () => {
    await testManager.close();
  });

  describe('Entity Preprocessor should apply validation constraints when "toDbEntities" is executed', () => {
    it.skip('should throw an exception when the scorecard rating for a given project cannot be computedt', async () => {
      // Given
      const raw: RawDataIngestionData = {
        Projects: [
          {
            project_name: 'China Salt marsh Conservation Large',
            continent: 'Asia',
            country: 'China',
            country_code: 'CHN',
            ecosystem: ECOSYSTEM.SALT_MARSH,
            activity: ACTIVITY.CONSERVATION,
            price_type: PROJECT_PRICE_TYPE.OPEX_BREAKEVEN,
            project_size_ha: 8000,
            project_size_filter: 'Large',
            project_abatement_potential: 1044882,
            country_abatement_potential: 1044882,
            total_cost_npv: 4848562,
            total_cost: 7842918,
            capex_npv: 1342839,
            capex: 1430000,
            opex_npv: 3505723,
            opex: 6412918,
            cost_per_tco2e: 20,
            cost_per_tco2e_npv: 20,
            feasibility_analysis_npv: 50000,
            feasibility_analysis: 50000,
            conservation_planning_npv: 629559,
            conservation_planning: 667067,
            data_collection_npv: 76963,
            data_collection: 80000,
            community_representation_npv: 314213,
            community_representation: 332933,
            blue_carbon_project_planning_npv: 88900,
            blue_carbon_project_planning: 100000,
            establishing_carbon_rights_npv: 138755,
            establishing_carbon_rights: 150000,
            validation_npv: 44450,
            validation: 50000,
            implementation_labor_npv: 0,
            implementation_labor: 0,
            monitoring_npv: 234386,
            maintenance_npv: 0,
            monitoring: 388000,
            maintenance: 0,
            monitoring_maintenance_npv: 234386,
            monitoring_maintenance: 388000,
            community_benefit_npv: 2386930,
            community_benefit: 4537558,
            carbon_standard_fees_npv: 26337,
            carbon_standard_fees: 49360,
            baseline_reassessment_npv: 75812,
            baseline_reassessment: 120000,
            mrv_npv: 167296,
            mrv: 300000,
            long_term_project_operating_npv: 614961,
            long_term_project_operating: 1018000,
            initial_price_assumption: 30,
            leftover_after_opex: 2662198,
            leftover_after_opex_NPV: 1268137,
            total_revenue: 9075116,
            total_revenu_npv: 4773860,
            credits_issued: 246801,
            activity_type: RESTORATION_ACTIVITY_SUBTYPE.HYBRID,
          },
        ],
        'Project size': [],
        'Feasibility analysis': [],
        'Conservation planning and admin': [],
        'Data collection and field costs': [],
        'Community representation': [],
        'Blue carbon project planning': [],
        'Establishing carbon rights': [],
        'Financing cost': [],
        Validation: [],
        Monitoring: [],
        Maintenance: [],
        'Community benefit sharing fund': [],
        'Baseline reassessment': [],
        MRV: [],
        'Long-term project operating': [],
        'Carbon standard fees': [],
        'Community cash flow': [],
        'Ecosystem extent': [],
        'Ecosystem loss': [],
        'Restorable land': [],
        'Sequestration rate': [],
        'Emission factors': [],
        'Implementation labor': [],
        Base_size_table: [],
        Base_increase: [],
        'Model assumptions': [],
        'Sources table': [],
      };
      const entityPreprocessor = testManager.getApp().get(EntityPreprocessor);

      // When
      let parsedDBEntities;
      let error;
      try {
        parsedDBEntities = await entityPreprocessor.toDbEntities(raw);
      } catch (err) {
        error = err;
      }

      // Then
      expect(parsedDBEntities).toBeUndefined();
      expect(error).toBeInstanceOf(ProjectScoreCardNotFoundError);
    });
  });
});
