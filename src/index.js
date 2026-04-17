/**
 * Example showcasing the Surface Grid Series feature of LightningChart JS.
 */
// Import LightningChartJS
const lcjs = require('@lightningchart/lcjs')

// Import xydata
const xydata = require('@lightningchart/xydata')

const {
    lightningChart,
    LUT,
    PalettedFill,
    emptyLine,
    ColorShadingStyles,
    UIElementBuilders,
    UIOrigins,
    UIDraggingModes,
    regularColorSteps,
    LegendPosition,
    contoursFromLUT,
    Themes,
} = lcjs
const { createWaterDropDataGenerator } = xydata

const HEATMAP_COLUMNS = 1024
const HEATMAP_ROWS = 1024

// Initialize empty Dashboard and charts.
// NOTE: Using `Dashboard` is no longer recommended for new applications. Find latest recommendations here: https://lightningchart.com/js-charts/docs/more-guides/grouping-charts/
const dashboard = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
    .Dashboard({
        numberOfColumns: 2,
        numberOfRows: 1,
        theme: (() => {
    const t = Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined
    const smallView = window.devicePixelRatio >= 2
    if (!window.__lcjsDebugOverlay) {
        window.__lcjsDebugOverlay = document.createElement('div')
        window.__lcjsDebugOverlay.style.cssText = 'position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;z-index:99999;font:12px monospace;pointer-events:none'
        if (document.body) document.body.appendChild(window.__lcjsDebugOverlay)
        setInterval(() => {
            if (!window.__lcjsDebugOverlay.parentNode && document.body) document.body.appendChild(window.__lcjsDebugOverlay)
            window.__lcjsDebugOverlay.textContent = window.innerWidth + 'x' + window.innerHeight + ' dpr=' + window.devicePixelRatio + ' small=' + (window.devicePixelRatio >= 2)
        }, 500)
    }
    return t && smallView ? lcjs.scaleTheme(t, 0.5) : t
})(),
textRenderer: window.devicePixelRatio >= 2 ? lcjs.htmlTextRenderer : undefined,
    })
    .setColumnWidth(0, 1.0)
    .setColumnWidth(1, 1.8)

const chart2D = dashboard
    .createChartXY({
        columnIndex: 0,
        rowIndex: 0,
        legend: { visible: false },
    })
    .setTitle('Generating test data ...')

const chart3D = dashboard
    .createChart3D({
        columnIndex: 1,
        rowIndex: 0,
        legend: {
            position: LegendPosition.BottomCenter,
        },
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
            .setContours({
                valueSource: 'y',
                ...contoursFromLUT(lut),
            })

        // Add selector to see difference between Simple and Phong 3D color shading style in Surface grid series.
        const selectorColorShadingStyle = chart3D
            .addUIElement(UIElementBuilders.CheckBox)
            .setPosition({ x: 100, y: 100 })
            .setOrigin(UIOrigins.RightTop)
            .setMargin({ top: 40, right: 8 })
            .setDraggingMode(UIDraggingModes.notDraggable)
        selectorColorShadingStyle.addEventListener('switch', (event) => {
            surfaceSeries3D.setColorShadingStyle(event.state ? new ColorShadingStyles.Phong() : new ColorShadingStyles.Simple())
            selectorColorShadingStyle.setText(`Color shading style: ${event.state ? 'Phong' : 'Simple'}`)
        })
        selectorColorShadingStyle.setOn(false).setText(`Color shading style: Simple`)
    })
