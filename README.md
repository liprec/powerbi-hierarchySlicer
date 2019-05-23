# Power BI HierachySlicer

[![Build Status](https://dev.azure.com/datascenarios/GitHub%20Projects/_apis/build/status/powerbi-hierarchySlicer?branchName=master)](https://dev.azure.com/datascenarios/GitHub%20Projects/_build/latest?definitionId=13?branchName=master)

Home for my Power BI Custom Visual: HierarchySlicer

## Build

Some changes are needed before this visual can be build:

Changes to `node_modules/powerbi-visuals-api/schema.capablities.json`:

Replace row 1018:
```
},
"fontFamily": {
    "type": "boolean",
    "description": "Displays a selector to allow the user to font family"
}
```

Replace (now) row 1040:
```
},
{
    "required": [
        "fontFamily"
    ]
}
```

## Support

If you need any support related to this visual, feel free to create an issue and describe what the problem in. If you can add a sample PBIX file with, that would help me a lot.