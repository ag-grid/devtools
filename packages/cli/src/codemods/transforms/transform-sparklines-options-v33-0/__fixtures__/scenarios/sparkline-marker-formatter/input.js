const markerFormatter = {
    cellRendererParams: {
        sparklineOptions: {
            marker: {
                formatter: function(params) {
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

const markerFormatterWithDestruct = {
    cellRendererParams: {
        sparklineOptions: {
            marker: {
                size: 3,
                fill: 'green',
                stroke: 'green',
                strokeWidth: 2,
                formatter: function({ first, last }) {
                    if (first || last) {
                        return {
                            fill: "rgb(255,0,0)"
                        };
                    }
                }
            }
        }
    }
}
