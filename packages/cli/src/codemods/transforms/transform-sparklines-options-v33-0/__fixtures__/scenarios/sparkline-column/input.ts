// @ts-nocheck
import { testType } from './test-type';
const column = {
    cellRendererParams: {
        sparklineOptions: {
            type: 'column'
        }
    }
}
const bar = {
    cellRendererParams: {
        sparklineOptions: {
            type: 'bar'
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
const typeVariable = 'column'
const shouldWarn1 = {
    cellRendererParams: {
        sparklineOptions: {
            type: typeVariable
        }
    }
}
const type = 'column'
const shouldWarn2 = {
    cellRendererParams: {
        sparklineOptions: {
            type
        }
    }
}
const shouldWarn3 = {
    cellRendererParams: {
        sparklineOptions: {
            type: (() => 'column')()
        }
    }
}
const shouldWarn4 = {
    cellRendererParams: {
        sparklineOptions: {
            type: testType
        }
    }
}
