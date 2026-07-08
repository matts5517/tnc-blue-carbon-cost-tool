import Link from "next/link";

import { CustomProjectSummary } from "@shared/dtos/custom-projects/custom-project-output.dto";

import MethodologyTable from "@/containers/methodology/table";
import { qualitativeScoreCardData } from "@/containers/methodology/table/data";

import { Button } from "@/components/ui/button";
import { List } from "@/components/ui/list";
import { ScrollArea } from "@/components/ui/scroll-area";

export const OVERVIEW = {
  SCORECARD_RATING:
    "The individual non-economic scores, in addition to the economic feasibility and abatement potential, are weighted using the weights on the left to an overall score per project",
  COST: "Cost per tCO2e (incl. CAPEX and OPEX)",

  ABATEMENT_POTENTIAL:
    "Estimation of the total amount of CO2e credit potential that is expected during the life of the project. Used to determine whether the scale justifies the development costs",
  TOTAL_COST: "Total cost (incl. CAPEX and OPEX)",
};

export const SCORECARD_PRIORITIZATION = {
  FINANCIAL_FEASIBILITY:
    "Evaluation of the forecasted costs, revenues, and potential break-even price for carbon credits.",
  LEGAL_FEASIBILITY:
    "Evaluation of whether a country has the legal protection, government infrastructure, and political support that is required for a project to successfully produce carbon credits. Focus will also be on community aspects and benefits for community. See methodology section for more details behind assumptions and sources used.",
  IMPLEMENTATION_FEASIBILITY:
    "Assessment of the permanence risk a project faces due to deforestation and natural disasters. Used to determine whether a project will achieve the estimated abatement and approval for credit issuance. See methodology section for more details behind assumptions and sources used.",
  SOCIAL_FEASIBILITY:
    "Assessment of the leakage risk a project faces from communities reverting to previous activities that degraded or destroyed ecosystems (e.g., deforestation, walling off shrimp ponds, etc.). See methodology section for more details behind assumptions and sources used.",
  SECURITY_FEASIBILITY:
    "Assessment of the safety threat to individuals entering the country. Used to determine the physical risk posed to on-the-ground teams. See methodology section for more details behind assumptions and sources used.",
  AVAILABILITY_OF_EXPERIENCED_LABOR:
    "Assessment of whether a country has a pre-existing labor pool with experience in conservation or restoration work, based on the number of blue carbon or AFOLU carbon projects completed or in development.",
  AVAILABILITY_OF_ALTERNATIVE_FUNDING:
    "Assessment of the possibility a project could access revenues outside of carbon credits (e.g., grants, biodiversity credits, resilience credits, etc.) to cover gaps between costs and carbon pricing. See methodology section for more details behind assumptions and sources used.",
  COASTAL_PROTECTION_BENEFIT:
    "Estimation of a project’s ability to reduce community risk through improved coastal resilience, to inform likelihood of achieving higher credit price.",
  BIODIVERSITY_BENEFIT:
    "Estimation of a project's impact on biodiversity, to inform likelihood of achieving higher credit price.",
  ABATEMENT_POTENTIAL:
    "Estimation of the total amount of CO2e credit potential that is expected during the life of the project. Used to determine whether the scale justifies the development costs",
};

export const KEY_COSTS = {
  TOTAL_COST:
    "Total cost, including Capital Expenditures (CAPEX) and Operational Expenditures (OPEX).",
  IMPLEMENTATION_LABOR:
    "Only applicable to restoration. The costs associated with labor and materials required for rehabilitating the degraded area (hydrology, planting or hybrid).",
  COMMUNITY_BENEFIT_SHARING_FUND:
    "Approximated as a percent (%) of the carbon credit revenues for the landowner/community residing where the project takes place. Best practice is to use the benefit share to meet the community's socio-economic and financial priorities, per the benefit sharing agreement. This benefit share may be used to compensate for alternative livelihoods and/or opportunity cost, which can be realized through goods, services, infrastructure, and/or cash.",
  MONITORING_AND_MAINTENANCE: (
    <>
      <ul className="space-y-2">
        <li>
          Monitoring: The expenses related to individuals moving throughout the
          project site to prevent degradation and report necessary
          actions/changes. See Methodology section (Project costs - assumptions)
          for more details.
        </li>
        <li>
          Maintenance: Only applicable to restoration. The costs associated with
          the physical upkeep of the original implementation, such as pest
          control, removing blockages, and rebuilding small portions.
        </li>
        <li></li>
      </ul>
    </>
  ),
  COMMUNITY_REPRESENTATION:
    "Efforts aimed at supporting a free, prior and informed consent process with communities who are involved with or may be impacted by the project. This can include assessing community needs, conducting stakeholder surveys and trainings, providing education about blue carbon market projects, and supporting a community-led design.",
  CONSERVATION_PLANNING:
    "Activities in the project start-up phase like project management, vendor coordination, fundraising, research, travel, etc.",
  LONG_TERM_OPERATING:
    "The expenses related to project oversight, vendor coordination, community engagement, stakeholder management, etc., during the ongoing operating years of the project.",
  CARBON_STANDARD_FEES:
    "Administrative fees charged by the carbon standard (e.g., Verra).",
};

export const FILTERS = {
  CONTINENT:
    "Continents are displayed based on the inclusion of countries with available data for blue carbon projects within each region.",
  COUNTRY:
    "Select a country. Country options are based on the availability of data supporting blue carbon projects. If your country is not listed, we suggest choosing a country that is most similar in terms of ecosystem, climate and/or cost of labor. ",
  ECOSYSTEM: (
    <>
      <p>
        Activity refers to the overarching strategy implemented in a blue carbon
        project to protect or enhance ecosystem health and carbon sequestration.
        Projects can focus on either Restoration (removals) or Conservation
        (avoided loss):
      </p>
      <List>
        <li>
          Conservation: Aims to maintain existing ecosystems, preventing
          degradation and preserving their carbon storage and sequestration
          potential. Conservation is cost-effective and crucial for long-term
          climate mitigation, offering benefits like avoiding biodiversity loss,
          ensuring ecosystem resilience, and reducing financial investment
          compared to restoration. However, proving additionality can be
          challenging.
        </li>
        <li>
          Restoration: Focuses on rehabilitating lost or degraded ecosystems to
          restore their functionality and enhance carbon capture and storage.
          While often more resource-intensive, restoration projects are highly
          visible and impactful. Restoration is implemented through one of three
          approaches: planting, hydrology, or a hybrid of the two.
        </li>
      </List>
    </>
  ),
  ACTIVITY_TYPE: (
    <>
      <p>
        Activity refers to the overarching strategy implemented in a blue carbon
        project to protect or enhance ecosystem health and carbon sequestration.
        Projects can focus on either Restoration (removals) or Conservation
        (avoided loss):
      </p>
      <List>
        <li>
          <strong>Conservation:</strong> Aims to maintain existing ecosystems,
          preventing degradation and preserving their carbon storage and
          sequestration potential. Conservation is cost-effective and crucial
          for long-term climate mitigation, offering benefits like avoiding
          biodiversity loss, ensuring ecosystem resilience, and reducing
          financial investment compared to restoration. However, proving
          additionality can be challenging.
        </li>
        <li>
          <strong>Restoration:</strong> Focuses on rehabilitating lost or
          degraded ecosystems to restore their functionality and enhance carbon
          capture and storage. While often more resource-intensive, restoration
          projects are highly visible and impactful. Restoration is implemented
          through one of three approaches: planting, hydrology, or a hybrid of
          the two.
        </li>
      </List>
    </>
  ),
  COST: "Total project cost (incl. CAPEX and OPEX).",
  ABATEMENT_POTENTIAL:
    "The estimated annual credit potential, measured as tons of carbon dioxide equivalents (tCO2e/year).",
  PROJECT_SIZE: (
    <>
      <p>
        Project size refers to the proposed scale of restoration or conservation
        efforts, measured in hectares, and was determined using a standardized
        approach to ensure comparability across different ecosystems and project
        types.
      </p>
      <p>
        Sizes are defined based on their &quot;carbon equivalency&quot; — the
        impact a conservation project has on carbon emissions is aligned with an
        equivalent restoration effort.
      </p>
      <p>
        For instance, &quot;medium&quot; projects involve 500 hectares of
        restored mangroves, salt marshes, or seagrass, compared to conservation
        efforts that avoid the loss of approximately 20,000 ha of mangroves,
        4,000 ha of salt marshes, or 2,000 ha of seagrass.
      </p>
      <p>
        This method allows for meaningful &quot;apples-to-apples&quot;
        comparisons across project activities and ecosystem types.
      </p>
      <p>
        <Button variant="link" className="p-0" asChild>
          <Link href="/methodology#project-size-assumptions">More info</Link>
        </Button>
      </p>
    </>
  ),
  BREAKEVEN_PRICE_TYPE: (
    <>
      <p>
        The Break-even Price Type determines which costs are used to calculate
        the minimum carbon credit price required to achieve financial break-even
        for a project:
      </p>
      <List>
        <li>
          <strong>Opex Breakeven:</strong> The minimum price per ton of CO₂e
          needed to cover only the operational expenditure (OPEX) of the
          project. This represents the ongoing annual costs of maintaining and
          monitoring the project after initial implementation.
        </li>
        <li>
          <strong>Total Cost Breakeven:</strong> The minimum price per ton of
          CO₂e needed to cover all project costs, including both capital
          expenditure (CAPEX) and operational expenditure (OPEX). This
          represents the complete financial investment required to establish and
          operate the project.
        </li>
      </List>
      <p>
        These options allow for evaluating different financial scenarios based
        on project cost structures and can inform carbon credit price
        negotiations.
      </p>
    </>
  ),
  COST_TYPE: (
    <>
      <p>
        The Cost Type defines the method used to calculate and present project
        costs. It offers two approaches to understand the financial requirements
        of a project:
      </p>
      <List>
        <li>
          <strong>Total Cost:</strong> The full cost of the project, including
          both capital expenditures (CAPEX) and operational expenditures (OPEX),
          without adjustments for the time value of money. This provides a
          straightforward, cumulative view of project costs.
        </li>
        <li>
          <strong>Net Present Value (NPV) Cost:</strong> The present value of
          total project costs (CAPEX + OPEX) per ton of CO₂e, excluding
          financing costs. The NPV Cost accounts for the time value of money,
          providing a more accurate view of a project&apos;s long-term financial
          viability. This metric allows for better comparison across projects by
          normalizing future costs to their present-day value.
        </li>
      </List>
      <p>
        These two cost perspectives offer different insights into project
        affordability and financial planning.
      </p>
    </>
  ),
};

export const MAP_LEGEND =
  "Comparison of the average project cost per credit ($USD/tCO2e) and the estimated total abatement potential (tCO₂e/yr) for each geography.";

export const PROJECT_DETAILS = {
  TOTAL_PROJECT_COST_NPV:
    "The total cost associated with a hypothetical blue carbon project, including both capital expenditures (CAPEX) and operating expenditures (OPEX) but excluding financing costs, and considering the time value of money.",
  TOTAL_PROJECT_COST:
    "The total cost associated with a hypothetical blue carbon project, including both capital expenditures (CAPEX) and operating expenditures (OPEX) but excluding financing costs.",
  NET_REVENUE_AFTER_OPEX_TOTAL_COST:
    "Net revenue is equal to income from carbon credit sales minus OPEX.",
  CREDIT_POTENTIAL:
    "The estimated credit potential (tCO2e) over 20 years of the project.",
  OVERALL_SCORE:
    "The non-economic scores, in addition to the economic feasibility and credit potential, are weighted to an overall score per project.",
  SCORE_CARD_RATINGS: (
    <MethodologyTable data={qualitativeScoreCardData} categorized />
  ),
  COST_ESTIMATES: (
    <>
      <section className="mb-4">
        <h3 className="text-md font-medium">Capital Expenditures (CAPEX)</h3>
        <p className="mb-2">
          These are one-time costs incurred during the project setup/development
          phase:
        </p>
        <List>
          <li>
            Feasibility Analysis: Assessing GHG mitigation potential, financial
            and non-financial factors like legal and social considerations.
          </li>
          <li>
            Conservation Planning & Administration: Project start-up activities
            such as management, vendor coordination, fundraising, research, and
            travel.
          </li>
          <li>
            Data Collection/Field Costs: Onsite sampling to gather essential
            data for project baseline and monitoring, including stock and flux
            data.
          </li>
          <li>
            Community Representation Work: Activities aimed at supporting a
            free, prior and informed consent process, including stakeholder
            surveys and trainings.
          </li>
          <li>
            Blue Carbon Project Planning & Administration: Developing the
            Project Design Document (PD), which may include advanced modeling.
          </li>
          <li>
            Establishing Carbon Rights: Legal processes for clarifying and
            securing carbon rights and agreements.
          </li>
          <li>
            Validation: Validation of the PD, following a recognized carbon
            standard process.
          </li>
          <li>
            Implementation Labor (Restoration Only): Costs of labor and
            materials for restoring lost or degraded areas, such as hydrological
            adjustments and planting efforts.
          </li>
        </List>
      </section>
      <section>
        <h3 className="text-md font-medium">Operating Expenditures (OPEX)</h3>
        <p className="mb-2">
          These are recurring costs during the project&apos;s operational phase
          has begun:
        </p>
        <List>
          <li>
            Monitoring: Activities to prevent site degradation and report
            necessary actions.
          </li>
          <li>
            Maintenance (Restoration Only): Physical upkeep, such as pest
            control and repairing damaged areas.
          </li>
          <li>
            Landowner/Community Benefit Share: Share of revenues to support
            alternative livelihoods or community priorities, such as
            infrastructure or goods.
          </li>
          <li>
            Baseline Reassessment: Periodic third-party evaluations of GHG
            reductions, as required by recognized carbon standards.
          </li>
          <li>
            Measuring, Reporting, and Verification (MRV): Costs of ongoing
            assessments and certifications of GHG reductions.
          </li>
          <li>
            Long-Term Project Operation & Administration: Oversight, stakeholder
            engagement, and coordination during ongoing project years.
          </li>
          <li>
            Carbon Standard Fees: Administrative fees charged by carbon
            standards.
          </li>
        </List>
      </section>
    </>
  ),
};

export const CUSTOM_PROJECT = {
  COUNTRY:
    "Select a country. Country options are based on the availability of data supporting blue carbon projects. If your country is not listed, we suggest choosing a country that is most similar in terms of ecosystem, climate and/or cost of labor.",
  PROJECT_SIZE: "Insert project size in hectares.",
  ECOSYSTEM:
    "Select a single ecosystem. Ecosystems included based on their role in carbon sequestration and eligibility on the carbon market. These include mangroves, seagrasses, and salt marshes.",
  ACTIVITY_TYPE: (
    <>
      <p>
        Select a single activity. Activity refers to the overarching strategy
        implemented in a blue carbon project to protect or enhance ecosystem
        health and carbon sequestration. Projects can focus on either
        Restoration (removals) or Conservation (avoided loss):
      </p>
      <List>
        <li>
          <strong>Conservation:</strong> Aims to maintain existing ecosystems,
          preventing degradation and preserving their carbon storage and
          sequestration potential. Conservation is cost-effective and crucial
          for long-term climate mitigation, offering benefits like avoiding
          biodiversity loss, ensuring ecosystem resilience, and reducing
          financial investment compared to restoration. However, proving
          additionality can be challenging.
        </li>
        <li>
          <strong>Restoration:</strong> Focuses on rehabilitating lost or
          degraded ecosystems to restore their functionality and enhance carbon
          capture and storage. While often more resource-intensive, restoration
          projects are highly visible and impactful. Restoration is implemented
          through one of three approaches: planting, hydrology, or a hybrid of
          the two.
        </li>
      </List>
    </>
  ),
};

export const RESTORATION_PROJECT_DETAILS = {
  ACTIVITY_TYPE: (
    <>
      <p>
        Restoration activity type describes the specific methods used in
        restoration projects to rehabilitate lost or degraded ecosystems. The
        Blue Carbon Cost Tool supports three types of restoration activities:
      </p>
      <List>
        <li>
          <strong>Planting:</strong> Includes activities such as planting seeds,
          creating nurseries, and other efforts to regenerate vegetation in
          degraded ecosystems.
        </li>
        <li>
          <strong>Hydrology:</strong> Focuses on repairing and restoring natural
          water flow and ecosystem health. This involves tasks like erosion
          control, excavation, and building infrastructure such as culverts or
          breakwaters. Hydrology projects often require heavy machinery and tend
          to be more capital-intensive than planting projects.
        </li>
        <li>
          <strong>Hybrid:</strong> Combines planting and hydrology techniques
          for a comprehensive restoration approach that addresses multiple
          ecosystem needs.
        </li>
      </List>
      <p>
        Each restoration activity type addresses specific challenges and
        ecosystem conditions, allowing tailored interventions for maximum
        impact.
      </p>
    </>
  ),
  SEQUESTRATION_RATE: (
    <>
      <p>
        The sequestration rate used represents the rate at which a blue carbon
        project captures and stores carbon dioxide equivalent (CO2e) within its
        ecosystem. The tool allows selection from three tiers of sequestration
        rate options:
      </p>
      <List>
        <li>
          Tier 1 - Global Sequestration Rate: A default value provided by the
          IPCC, applicable to all ecosystems.
        </li>
        <li>
          Tier 2 - Country-Specific Sequestration Rate: National-level
          sequestration rates, which are more specific but limited in
          availability.
        </li>
        <li>
          Tier 3 - Project-Specific Sequestration Rate: Allows users to provode
          a custom sequestration rates based on site-specific data, entered
          directly into the tool.
        </li>
      </List>
      <p>
        <strong>Note:</strong> not all ecosystems have Tier 2 default values.
      </p>
      <List>
        <li>
          Methane (CH4) and nitrous oxide (N2O) emissions are not currently
          included in the default sequestration rate values of the model.
          However, it is possible to incorporate CH4 and N2O emissions if the
          user possesses project-specific data. In such cases, the emissions
          should be converted to their respective CO2e before being added to the
          dashboard. For instance, if a project removes 0.71 CO2 but introduces
          0.14 tCO2e of CH4 and 0.12 tCO2e of N2O, the net sequestration value
          would be 0.45 tCO2e.
        </li>
        <li>
          We assume, conservatively, that all soil organic carbon has been lost
          post-disturbance. As such, we do not include emissions reductions from
          avoided loss of soil organic carbon in restoration scenarios. If the
          user has this data available, it can be included in the
          project-specific sequestration rates as described above.
        </li>
      </List>
    </>
  ),
  PROJECT_SPECIFIC_SEQUESTRATION_RATE:
    "The project-specific sequestration rate (Tier 3) refers to a customized sequestration rate derived from detailed site-specific data unique to a particular project. This rate provides the most accurate representation of carbon sequestration potential by incorporating local environmental conditions, ecosystem characteristics, and project-specific factors. It must be directly entered into the tool to tailor calculations to the specific circumstances of the project.",
  PLANTING_SUCCESS_RATE:
    "The planting success rate refers to the percentage of vegetation or trees successfully established and thriving in a reforestation or afforestation project. This metric is critical for assessing the effectiveness of restoration activities and estimating the carbon sequestration potential of the project. A higher planting success rate indicates more robust ecosystem recovery and greater likelihood of achieving the project’s environmental and climate objectives.",
};

export const CONSERVATION_PROJECT_DETAILS = {
  LOSS_RATE_USED: (
    <>
      <p>
        The loss rate used represents the percentage of an ecosystem&apos;s
        carbon stock expected to be lost annually due to degradation or
        deforestation. The tool allows selection between:
      </p>
      <List>
        <li>
          <strong>National average loss rate:</strong> Reflects the average rate
          of ecosystem loss specific to the country. Note: Not available for all
          ecosystems.
        </li>
        <li>
          <strong>Global average loss rate:</strong> Default values applied for
          loss rates where no national or project-specific data is available.
        </li>
        <li>
          <strong>Project-specific loss rate:</strong> A customized rate based
          on site-specific data, which can be manually entered for enhanced
          precision.
        </li>
      </List>
      <p>
        While default loss rates do not factor in background recovery rates,
        these can be incorporated when using project-specific loss rates.
      </p>
    </>
  ),

  PROJECT_SPECIFIC_LOSS_RATE: (
    <p>
      The Project-Specific Loss Rate allows users to manually customize data on
      ecosystem loss tailored to the specific conditions of the project site.
      This loss rate reflects the unique degradation or disturbance factors
      affecting the project&apos;s ecosystem, allowing for a more accurate
      representation of carbon sequestration potential. It is particularly
      useful when the national or global default loss rates do not sufficiently
      capture the specific environmental, economic, or operational factors
      influencing the project area.
    </p>
  ),

  EMISSION_FACTOR_USED: (
    <>
      <p>
        The Emission Factor Used allows the selection of emission factors from
        three distinct tiers, providing flexibility based on the level of
        available data for the project:
      </p>
      <List>
        <li>
          <strong>Tier 1:</strong> Utilizes global default emission factors,
          offering a general yearly estimate per hectare, suitable when local
          data is unavailable.
        </li>
        <li>
          <strong>Tier 2:</strong> Uses country-specific values derived from
          literature sources, modeling Above-Ground Biomass (AGB) and Soil
          Organic Carbon (SOC) emissions separately. Note: Tier 2 default values
          are not available for all ecosystems.
        </li>
        <li>
          <strong>Tier 3:</strong> Enables the use of project-specific emission
          factors, which can be entered either as a single value (similar to
          Tier 1) or as separate AGB and SOC values (similar to Tier 2), based
          on the specific data available for the project.
        </li>
      </List>
      <p>
        Note: The model does not currently account for methane (CH4) and nitrous
        oxide (N2O) emissions in the default emission factor values. However,
        these emissions can be included if project-specific data is available,
        following the appropriate conversion to CO2e.
      </p>
    </>
  ),

  PROCET_SPECIFIC_EMISSIONS_TYPE: (
    <>
      <p>
        The Tier 3 - Project-Specific Emissions approach allows for the highest
        level of customization and accuracy in estimating emissions. This can be
        achieved by either:
      </p>
      <List>
        <li>
          Providing a single, consolidated emission factor specific to the
          project, which accounts for all relevant sources of emissions, or
        </li>
        <li>
          Separating emissions into Above-Ground Biomass (AGB) and Soil Organic
          Carbon (SOC) components, with distinct values entered for each.
        </li>
      </List>
      <p>
        This tier relies on project-specific data, offering the most precise
        reflection of local conditions and practices.
      </p>
      <p>
        <strong>Note:</strong> Default values are not available for Tier 3,
        requiring the user to insert comprehensive project data manually.
      </p>
    </>
  ),

  EMISSION_FACTOR: (
    <List>
      <li>
        <strong>One emission:</strong> Tier 3 allows the user to insert a
        project-specific emission factor, which is entered as a single value in
        tCO2e per hectare per year.
      </li>
    </List>
  ),

  SOC_EMISSIONS: (
    <List>
      <li>
        <strong>SOC and AGB separately:</strong> Tier 3 - Separate AGB and SOC
        allows for the entry of project-specific emission factors for both
        Aboveground Biomass (AGB) and Soil Organic Carbon (SOC), each expressed
        in tCO2e per hectare per year. By separating AGB and SOC, this approach
        enables a more detailed and tailored estimate of carbon sequestration
        and emissions specific to the project site. The AGB value represents the
        committed emissions from aboveground vegetation, such as trees, shrubs,
        and other plant matter, while the SOC value accounts for the carbon
        stored in the soil. Both of these emission factors are influenced by
        local conditions, land use practices, and ecosystem characteristics.
        Entering these values separately provides a more precise reflection of
        the project&apos;s carbon dynamics and allows for a more accurate
        calculation of overall emissions reductions or sequestration potential.
      </li>
    </List>
  ),
};

export const GENERAL_ASSUMPTIONS = {
  CARBON_REVENUES_TO_COVER:
    "Carbon Revenues to Cover provides the flexibility to determine whether carbon revenues should be used to cover only OPEX (Operational Expenditures) or both CAPEX (Capital Expenditures) and OPEX. This option allows developers to account for external funding sources such as grants or philanthropic contributions that may be used to cover a portion of the costs.",
  INITIAL_CARBON_PRICE_ASSUMPTIONS: (
    <p>
      Initial Carbon Price Assumptions (in $USD) sets the default market price
      per ton of CO<sub>2</sub> equivalent (tCO<sub>₂e</sub>) for carbon
      credits. This price is used to estimate potential revenue from carbon
      credits, and can be adjusted based on market conditions or projections.
    </p>
  ),
};

export const ASSUMPTIONS = {
  VERIFICATION_FREQUENCY: (
    <p>
      Verification Frequency refers to how often the carbon credits generated by
      the project will be verified by a third-party entity. As verification
      incurs separate fees, project proponents must decide how often to verify
      depending on the anticipated rate of accrued climate benefit. Most carbon
      standards require verification at least every 5 years.
    </p>
  ),
  DISCOUNT_RATE: (
    <p>
      The user has an option to customize their restoration rate depending on
      what is feasibly restorable per year.
    </p>
  ),
  CARBON_PRICE_INCREASE: (
    <p>
      The assumed increase in carbon price (as a % over time). Note, this does
      not include inflation, as the model does not account for inflation or cost
      increases in its calculations.
    </p>
  ),
  BUFFER: (
    <p>
      Carbon credit calculations include a buffer deduction that accounts for
      uncertainty, leakage, and non-permanence risks associated with the
      project. A default deduction, which can be adjusted by a tool user, of 20%
      is applied, based on expert consultation, feasibility studies and Perera
      et al., 2024 reporting that most registered blue carbon project buffers
      were between 10 and 30%. A 20% buffer also aligns with the Integrity
      Council for the Voluntary Carbon Market’s Core Carbon Principles (2024).
    </p>
  ),

  BASELINE_REASSESSMENT_FREQUENCY: (
    <p>
      Baseline Reassessment Frequency refers to how often the baseline emissions
      or sequestration values are reassessed to ensure the project&apos;s
      ongoing accuracy in estimating carbon impacts. This is typically done at
      regular intervals to account for changes in project conditions or new
      data, ensuring that the original assumptions remain valid throughout the
      project&apos;s lifespan. Each baseline reassessment will incur additional
      cost, which the tool accounts for according to the frequency set. The
      default is every 10 years.
    </p>
  ),

  CONSERVATION_PROJECT_LENGTH: (
    <p>
      Conservation Project Length refers to the duration over which conservation
      efforts are implemented and maintained. The tool default project length is
      20 years but may be adjusted to up to 30 years.
    </p>
  ),

  RESTORATION_RATE: (
    <div>
      <p>
        The rate at which a degraded or damaged ecosystem is restored or
        rehabilitated to its original or desired state.
      </p>
      <p>
        Users have the option to adapt the restoration rate depending on what is
        feasibly restorable per year. Make sure the project size aligns with
        this rate and the duration of the restoration activity. For example, if
        the reasonable restoration rate is 50 ha / year and you will restore for
        five years, your project size will be 250 ha total.
      </p>
    </div>
  ),

  RESTORATION_PROJECT_LENGTH: (
    <p>
      Restoration Project Length refers to the duration over which restoration
      efforts are implemented and maintained. The tool default project length is
      20 years but may be adjusted to up to 30 years.
    </p>
  ),
};

export const CUSTOM_PROJECT_OUTPUTS = {
  TOTAL_PROJECT_COST:
    "The total financial investment required for the project, including both capital expenditure (CAPEX) and operating expenditure (OPEX), expressed as NPV (Net Present Value).",
  NET_REVENUE_AFTER_OPEX_TOTAL_COST:
    "The remaining net revenue after accounting for all operating expenses (OPEX) associated with the project.",
  NET_REVENUE_AFTER_CAPEX_OPEX_TOTAL_COST:
    "The remaining net revenue after accounting for all capital and operating expenses (CAPEX and OPEX) associated with the project.",
  ANNUAL_PROJECT_CASH_FLOW:
    "The net amount of cash generated or consumed by the project on an annual basis, accounting for revenues, CAPEX, and OPEX.",
};

export const PROJECT_SUMMARY: Record<keyof CustomProjectSummary, string> = {
  "$/tCO2e (total cost, NPV)":
    "The NPV of the total cost (CAPEX & OPEX, excl. financing cost) divided by the total credits the project will generate.",
  "$/ha":
    "The NPV of the total cost (CAPEX & OPEX, excl. financing cost) divided by the total ha of the project",
  "IRR when priced to cover OpEx":
    "The internal rate of return (IRR) calculated when carbon credits are priced to only cover the operating expenses (OPEX).",
  "IRR when priced to cover total cost":
    "The internal rate of return (IRR) calculated when carbon credits are priced to cover both capital (CAPEX) and operating expenses (OPEX).",
  "Total cost (NPV)":
    "The NPV of the total cost associated with the hypothetical blue carbon project (incl. CAPEX and OPEX, excl. financing cost).",
  "Capital expenditure (NPV)":
    "The NPV of the CAPEX associated with the hypothetical blue carbon project.",
  "Operating expenditure (NPV)":
    "The NPV of the OPEX associated with the hypothetical blue carbon project.",
  "Credits issued":
    "The carbon credits issued over the indicated project timeline. The buffer has already been subtracted from this total number",
  "Total abatement potential (tCO2e, without buffer)":
    "Total abatement potential (tCO2e, without buffer)",
  "Total revenue (NPV)": "The NPV of the carbon credit revenues.",
  "Total revenue (non-discounted)":
    "The non-discounted carbon credit revenues.",
  "Financing cost":
    "The financing cost is the time, effort and cost associated with securing financing for the set up (pre-revenue) phase of the project. Calculated as the financing cost assumption (default 5%) multiplied by the non-discounted CAPEX total.",
  "Funding gap (NPV)":
    "The gap for NPV to cover OPEX or OPEX + CAPEX, depending on which parameter is chosen.",
  "Funding gap per tCO2e (NPV)":
    "The gap for NPV to cover OPEX or OPEX + CAPEX, depending on which parameter is chosen, divided by tCO2e.",
  "Landowner/community benefit share":
    "The USD($) allocated to landowner/community, as dictated by the default or assigned percentage.",
  "Net revenue after OPEX":
    "Net revenue from sale of carbon credits at indicated price/ton, after accounting for OPEX.",
  "Net revenue after Total cost": "TODO",
};

export const COST_DETAILS = (
  <ScrollArea>
    <div className="space-y-2">
      <p>
        The cost details provide a comprehensive breakdown of the financial
        requirements for the project, divided into capital expenditure (CAPEX)
        and operating expenditure (OPEX), with values expressed in both total
        costs and their Net Present Value (NPV). Each category represents
        specific activities or components of the project:
      </p>

      <p>
        <strong>Total CAPEX:</strong> The total one-time costs required to
        establish the project.
      </p>
      <List>
        <li>
          Feasibility Analysis: The costs for evaluating the GHG mitigation
          potential, legal, social, and financial considerations during project
          setup.
        </li>
        <li>
          Conservation Planning and Administration: Expenses for planning and
          management activities, including vendor/contractor coordination,
          fundraising, research, and travel during the setup phase.
        </li>
        <li>
          Data Collection and Field Costs: The expenses related to field
          sampling for carbon stock, vegetation, soil characteristics, and
          hydrological data collection.
        </li>
        <li>
          Community Representation / Liaison: Costs associated with engaging
          communities through a free, prior and informed consent process, and
          conducting stakeholder surveys and trainings.
        </li>
        <li>
          Blue Carbon Project Planning: The preparation of project design
          documents, including modeling for sea level rise, hydrology, and
          ecosystem impact.
        </li>
        <li>
          Establishing Carbon Rights: Legal costs for defining carbon rights,
          establishing community agreements, and enabling valid carbon credit
          sales.
        </li>
        <li>
          Validation: Fees for third-party validation of the project design
          documentation.
        </li>
        <li>
          Implementation Labor: Costs for restoration-related labor and
          materials (if applicable, e.g., planting or hydrological
          interventions).
        </li>
      </List>

      <p>
        <strong>Total OPEX:</strong> The ongoing costs required to maintain and
        monitor the project throughout its operational lifespan.
      </p>
      <List>
        <li>
          Monitoring: Expenses for ensuring the project site remains intact,
          with regular checks to prevent degradation.
        </li>
        <li>
          Maintenance: Costs for maintaining the physical project infrastructure
          (if applicable, e.g., in restoration projects).
        </li>
        <li>
          Landowner/Community Benefit Share: A percentage of the project
          revenues allocated for community benefits, such as infrastructure,
          goods, or cash.
        </li>
        <li>
          Carbon Standard Fees: Administrative fees associated with carbon
          credit standards (e.g., registration or issuance).
        </li>
        <li>
          Baseline Reassessment: Costs for periodic re-evaluation of initial GHG
          reduction estimates.
        </li>
        <li>
          Measuring, Reporting, and Verification (MRV): Expenses for ongoing
          measurement, reporting, and verification of GHG emissions.
        </li>
        <li>
          Long-Term Project Operating: General expenses for continued oversight,
          stakeholder engagement, and vendor coordination over the
          project&apos;s lifetime.
        </li>
      </List>

      <p>
        <strong>Total Project Cost:</strong> The sum of all CAPEX and OPEX
        costs, expressed in both total value and NPV. The total project cost
        gives stakeholders a clear view of financial investment required for the
        hypothetical blue carbon project.
      </p>
    </div>
  </ScrollArea>
);

export const ANNUAL_PROJECT_CASHFLOW =
  "The Annual Project Cash Flow represents the year-by-year net financial outcome of the project, calculated as the total revenues (primarily from carbon credit sales) minus the annual operating expenditures (OPEX). This metric provides insight into the financial viability and sustainability of the project over its operational lifespan, highlighting when the project is expected to become profitable or break even.";

export const COST_INPUT_OVERRIDES =
  "While the tool as attempts to capture project costs into the below define cost buckets, users may want to be creative with entering their cost data depending on how it is tracked for your specific project. We recommend refering to the cost unit column to tailor cost assumptions accordingly. For example, if your project cost are not divided into cost buckets but you have an annual project cost amount, enter the annual cost into one of the cost line items which uses the $/yr unit and zero into all other cost buckets, as appropriate.";

export const RESTORATION_PLAN =
  "This feature allows users to customize the annual hectares restored in the project (otherwise the tool defaults to a fixed restoration rate, averaged over time). Be sure this number cooresponds to the total project size and timeline listed above.";
