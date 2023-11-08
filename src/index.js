/**
 * Example showcasing the Surface Grid Series feature of LightningChart JS.
 */
// Import LightningChartJS
const lcjs = require('@arction/lcjs')

// Import xydata
const xydata = require('@arction/xydata')

const {
    lightningChart,
    LUT,
    PalettedFill,
    emptyLine,
    ColorShadingStyles,
    LegendBoxBuilders,
    UIElementBuilders,
    UIOrigins,
    UIDraggingModes,
    regularColorSteps,
    Themes,
} = lcjs
const { createWaterDropDataGenerator } = xydata

const HEATMAP_COLUMNS = 1024
const HEATMAP_ROWS = 1024

// Initialize empty Dashboard and charts.
// NOTE: Using `Dashboard` is no longer recommended for new applications. Find latest recommendations here: https://lightningchart.com/js-charts/docs/basic-topics/grouping-charts/
const dashboard = lightningChart()
    .Dashboard({
        numberOfColumns: 2,
        numberOfRows: 1,
        // theme: Themes.darkGold
    })
    .setColumnWidth(0, 1.0)
    .setColumnWidth(1, 1.8)

const chart2D = dashboard
    .createChartXY({
        columnIndex: 0,
        rowIndex: 0,
    })
    .setTitle('Generating test data ...')

const chart3D = dashboard
    .createChart3D({
        columnIndex: 1,
        rowIndex: 0,
    })
    .setTitle('Generating test data ...')

// Generate example data.
createWaterDropDataGenerator()
    .setColumns(HEATMAP_COLUMNS)
    .setRows(HEATMAP_ROWS)
    .generate()
    .then((data) => {
        chart2D.setTitle(`2D Heatmap Grid ${HEATMAP_COLUMNS}x${HEATMAP_ROWS}`)
        chart3D.setTitle(`3D Surface Grid ${HEATMAP_COLUMNS}x${HEATMAP_ROWS} color by Y`)

        // Define value -> color lookup table.
        const theme = dashboard.getTheme()
        const lut = new LUT({
            interpolate: true,
            steps: regularColorSteps(0, 70, theme.examples.intensityColorPalette),
        })

        // Create series for both 2D and 3D heatmap data visualization and push data in.
        const heatmapSeries2D = chart2D
            .addHeatmapGridSeries({
                columns: HEATMAP_COLUMNS,
                rows: HEATMAP_ROWS,
            })
            .setFillStyle(new PalettedFill({ lut }))
            .setWireframeStyle(emptyLine)
            .invalidateIntensityValues(data)

        const surfaceSeries3D = chart3D
            .addSurfaceGridSeries({
                columns: HEATMAP_COLUMNS,
                rows: HEATMAP_ROWS,
            })
            .setFillStyle(new PalettedFill({ lut, lookUpProperty: 'y' }))
            .setWireframeStyle(emptyLine)
            .invalidateHeightMap(data)

        // Add selector to see difference between Simple and Phong 3D color shading style in Surface grid series.
        const selectorColorShadingStyle = chart3D
            .addUIElement(UIElementBuilders.CheckBox)
            .setPosition({ x: 100, y: 100 })
            .setOrigin(UIOrigins.RightTop)
            .setMargin({ top: 40, right: 8 })
            .setDraggingMode(UIDraggingModes.notDraggable)
        selectorColorShadingStyle.onSwitch((_, state) => {
            surfaceSeries3D.setColorShadingStyle(state ? new ColorShadingStyles.Phong() : new ColorShadingStyles.Simple())
            selectorColorShadingStyle.setText(`Color shading style: ${state ? 'Phong' : 'Simple'}`)
        })
        selectorColorShadingStyle.setOn(false).setText(`Color shading style: Simple`)

        // Add legend with color look up table to chart.
        const legend = chart3D.addLegendBox(LegendBoxBuilders.HorizontalLegendBox).add(chart2D).add(chart3D)
    })
