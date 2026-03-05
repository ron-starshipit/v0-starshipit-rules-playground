export interface Rule {
  where_key: string
  condition: string
  value_to_find: string
  set_key: string
  set_value: string
  rule_data_type: string
  children?: Rule[]
}

export const rulesData = {
  Accounts: [
    {
      AccountId: 77541,
      Rules: {
        data: [
          {
            where_key: "ItemCountry",
            condition: "Contains",
            value_to_find: "France",
            set_key: "ATL",
            set_value: "True",
            rule_data_type: "Outbound",
          },
          {
            where_key: "DestinationPostCodeNZ",
            condition: "Between",
            value_to_find: "0500-0700",
            set_key: "CheapestOption",
            set_value: "True",
            rule_data_type: "Outbound",
            children: [
              {
                where_key: "DestinationSuburbOrCity",
                condition: "Contains",
                value_to_find: "Avondale",
                set_key: "CheapestOption",
                set_value: "True",
                rule_data_type: "Outbound",
              },
            ],
          },
          {
            where_key: "Value",
            condition: "Greater Than",
            value_to_find: "49.99",
            set_key: "Signature",
            set_value: "True",
            rule_data_type: "Outbound",
          },
          {
            where_key: "DestinationState",
            condition: "Is",
            value_to_find: "VIC",
            set_key: "SetPackageType",
            set_value: "191531",
            rule_data_type: "Outbound",
          },
          {
            where_key: "OrderCreatedDate",
            condition: "Greater Than",
            value_to_find: "7",
            set_key: "ReturnCost",
            set_value:
              '{"StoreCreditShippingRates":[],"PaymentRefundShippingRates":[],"ExchangeProductShippingRates":[],"StoreCreditShippingRatesList":"","PaymentRefundShippingRatesList":"","ExchangeProductShippingRatesList":""}',
            rule_data_type: "Returns",
          },
          {
            where_key: "Weight",
            condition: "Greater Than",
            value_to_find: "3",
            set_key: "CarrierAndProductCode",
            set_value: '{"CarrierId":27,"ProductCode":"Pickup In Store","ContactId":0}',
            rule_data_type: "Outbound",
          },
          {
            where_key: "DestinationCountryCode",
            condition: "Contains",
            value_to_find: "US - United States",
            set_key: "CarrierAndProductCode",
            set_value: '{"CarrierId":32,"ProductCode":"Plain Label2","ContactId":0}',
            rule_data_type: "Outbound",
          },
          {
            where_key: "Tags",
            condition: "Contains",
            value_to_find: "tag",
            set_key: "AssignToAnotherAccount",
            set_value: "90887",
            rule_data_type: "Outbound",
          },
          {
            where_key: "ItemSKU",
            condition: "Is",
            value_to_find: "sku-untracked-1",
            set_key: "AssignTags",
            set_value: "[106586]",
            rule_data_type: "Outbound",
          },
          {
            where_key: "ItemSKU",
            condition: "Contains",
            value_to_find: "XXX",
            set_key: "CheapestOptionFromSpecificCarriers",
            set_value:
              '[{"Key":"Australia Post","Value":"7H05"},{"Key":"DoorDash","Value":"DoorDash"},{"Key":"TNT","Value":"76"}]',
            rule_data_type: "Outbound",
          },
          {
            where_key: "ItemSKU",
            condition: "Contains",
            value_to_find: "HISMILE-MANGO",
            set_key: "SplitOrderToAnotherAccountBySKU",
            set_value: "90887",
            rule_data_type: "Outbound",
          },
          {
            where_key: "DestinationContactName",
            condition: "Contains",
            value_to_find: "veryspecificname",
            set_key: "CheapestOption",
            set_value: "True",
            rule_data_type: "Outbound",
          },
          {
            where_key: "All",
            condition: "",
            value_to_find: "",
            set_key: "CheapestOption",
            set_value: "True",
            rule_data_type: "Outbound",
          },
        ],
        succeeded: true,
      },
    },
    {
      AccountId: 156609,
      Rules: {
        data: [],
        succeeded: true,
      },
    },
    {
      AccountId: 90887,
      Rules: {
        data: [],
        succeeded: true,
      },
    },
  ],
  HasErrors: false,
}
