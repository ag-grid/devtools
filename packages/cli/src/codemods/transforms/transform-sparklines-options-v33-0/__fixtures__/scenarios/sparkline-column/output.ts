// @ts-nocheck
const column = {
    cellRendererParams: {
        sparklineOptions: {
            type: 'bar',
            direction: 'vertical'
        }
    }
}
const shouldntChange0 = {
    sparklineOptions: {
        type: 'column'
    }
}

const shouldntChange1 = {
    _sparklineOptions: {
        type: 'column'
    }
}

const shouldntChange2 = {
    sparklineOptions: {
        type: 'asdadasqda'
    }
}
