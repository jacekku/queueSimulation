function shopQueueSimulation(MEAN_TIME_BETWEEN_CLIENTS, MEAN_TIME_OF_SERVICE, SIM_TIME, NUMBER_OF_CASHIERS = 1, BACKLOG = 0,SEED = 1) {
    logUsage = function (clientIndex, enteredAt, leftAt, serviceTime) {
        sim.log(`Client [${clientIndex}] left at ${leftAt}, 
            arrived at ${enteredAt}, 
            served for ${serviceTime}, 
            in queue for ${leftAt-serviceTime-enteredAt},
            total time ${leftAt-enteredAt}`)
    }

    let sim = new Sim()
    let random = new Random(SEED)
    let stats = new Sim.Population('n')
    let cashier = new Sim.Facility('Cashier', Sim.Facility.FCFS,NUMBER_OF_CASHIERS)
    const Client = {
        clientIndex: 0,
        start: function () {
            let i=0
            for(;i<BACKLOG;i++){
                this.order(i)
            }
            BACKLOG = 0
            this.clientIndex = i
            this.order(this.clientIndex)
            const nextClient = random.normal(MEAN_TIME_BETWEEN_CLIENTS, 5)
            this.setTimer(nextClient).done(this.start)
        },
        order: function (clientIndex) {
            const enteredAt = this.time()
            sim.log(`Client [${clientIndex}] enters queue`)
            stats.enter(enteredAt)
            let leftAt = null
            const serviceTime = random.normal(MEAN_TIME_OF_SERVICE, 5)
            this.useFacility(cashier, serviceTime).done(() => {
                leftAt = this.time()
                logUsage(clientIndex, enteredAt, leftAt, serviceTime)
                stats.leave(enteredAt, leftAt)
            })
        }
    }

    // sim.setLogger((str) => console.log(str))
    sim.addEntity(Client)
    sim.simulate(SIM_TIME)
    cashierStats = cashier
    return stats
}
// const MEAN_TIME_BETWEEN_CLIENTS = 95
// const MEAN_TIME_OF_SERVICE = 35

const CPK = {
    '6': 95,
    '7': 85,
    '8': 75,
    '9': 65,
    '10':60,
    '11':60,
    '12':60,
    '13':60,
    '14':60,
    '15':45,
    '16':40,
    '17':35,
    '18':28,
    '19':25,
    '20':40,
    '21':55,
    '22':80,
}
const CO = {
    '6': 35,
    '7': 45,
    '8': 52.5,
    '9': 57.5,
    '10':60,
    '11':60,
    '12':60,
    '13':60,
    '14':60,
    '15':65,
    '16':75,
    '17':100,
    '18':120,
    '19':150,
    '20':120,
    '21':75,
    '22':45,
}
const KN = {
    '6': 1,
    '7': 1,
    '8': 1,
    '9': 1,
    '10':1,
    '11':1,
    '12':3,
    '13':3,
    '14':3,
    '15':5,
    '16':5,
    '17':5,
    '18':8,
    '19':8,
    '20':8,
    '21':5,
    '22':5,
}

CSV = "Godzina;Liczba Kasjerów;CPK;CO;N;KN;MIN(s);MAX(s);AVG(s)\n"
backlog = 0
for (let hour=6;hour<=22;hour++){
    [CSVData,backlog] = simulateHour(CPK[hour],CO[hour], hour, KN[hour],backlog)
    console.log(backlog)
    CSV += CSVData
}
console.log(CSV)
if(document)document.write(CSV)

function simulateHour(MEAN_TIME_BETWEEN_CLIENTS,MEAN_TIME_OF_SERVICE, hour,numberOfCashiers,backlog){
    SIM_TIME = 60*60
    console.log('--- START --- ' + (hour||""))
    console.log(`Cpk = ${MEAN_TIME_BETWEEN_CLIENTS}; Co = ${MEAN_TIME_OF_SERVICE}; Time = ${SIM_TIME}`)
    const queueStats = shopQueueSimulation(MEAN_TIME_BETWEEN_CLIENTS, MEAN_TIME_OF_SERVICE, SIM_TIME, numberOfCashiers,backlog)
    // printResults(queueStats)
    console.log('--- DONE ---')
    return [resultToCSV(queueStats,MEAN_TIME_BETWEEN_CLIENTS,MEAN_TIME_OF_SERVICE,hour,numberOfCashiers),queueStats.population]
}

function printResults(queueStats){
    console.log(`${queueStats.name}: ${queueStats.population}`)
    console.log(`Kn: ${queueStats.durationSeries.Count}`)
    console.log(`MIN (s): ${queueStats.durationSeries.Min}`)
    console.log(`MAX (s): ${queueStats.durationSeries.Max}`)
    console.log(`AVG (s): ${queueStats.durationSeries.A}`)
}
function toComma(num){
    return `${num}`.replace('.',',')
}

function resultToCSV(queueStats,CPK,CO,hour,numberOfCashiers){
    const {durationSeries} = queueStats
    return `${hour};${numberOfCashiers};${toComma(CPK)};${toComma(CO)};${toComma(queueStats.population)};` +
        `${toComma(durationSeries.Count)};${toComma(durationSeries.Min)};${toComma(durationSeries.Max)};` +
        `${toComma(durationSeries.A)}\n`
}