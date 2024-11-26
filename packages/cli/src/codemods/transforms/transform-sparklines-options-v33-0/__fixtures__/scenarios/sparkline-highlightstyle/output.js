const highlightStyleExample = {
    cellRendererParams: {
        sparklineOptions: {
            marker: {
                itemStyler: function(params) {
                    if (params.highlighted) {
                        return {
                            fill: "rgb(0,255,255)"
                        };
                    }
                }
            }
        }
    }
}

const highlightStyleWithMarkerExample = {
    cellRendererParams: {
        sparklineOptions: {
            marker: {
                size: 3,
                fill: 'green',
                stroke: 'green',
                strokeWidth: 2,

                itemStyler: function(params) {
                    if (params.highlighted) {
                        return {
                            fill: "rgb(255,0,0)"
                        };
                    }
                }
            }
        }
    }
}
