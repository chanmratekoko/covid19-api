const fs = require('fs');
const moment = require("moment");
const { DIR } = require("../lib/constants");
const rawData = require('../tmp/raw_data');

console.log('Starting district wise data processing');
try {
  const StateDistrictWiseData = rawData.raw_data.reduce((acc, row) => {
    const todaysdate = moment().utcOffset("+6:30"); //set moment instance to MMT timezone and fetch currect MMT time
    const isToday = moment(todaysdate).add(-420, "m").isSame(moment(row.dateannounced + " 00:00 +0630", "DD-MM-YYYY HH:mm Z"), "day"); //Subtract 7 hours from IST time to persist values upto 7 AM and create moment instance from row.dateannounced in the IST Timezone
    let stateName = row.detectedstate;
      if(!stateName) {
        return acc;
        stateName = 'Unknown';
      }
    if(!acc[stateName]) {
      acc[stateName] = {districtData: {}};
    }
    let districtName = row.detecteddistrict;
      if(!districtName) {
        districtName = 'Unknown';
      }
    if(!acc[stateName].districtData[districtName]) {
      
      acc[stateName].districtData[districtName] = {
//         active: 0,
        confirmed: 0,
//         deaths: 0,
        lastupdatedtime: "",
//         recovered: 0,
        delta: {
          confirmed: 0
        }
      };
    }
    const currentDistrict = acc[stateName].districtData[districtName];
  
    currentDistrict.confirmed++;
    if (isToday) {
      currentDistrict.delta.confirmed++;
    }
//     if(row.currentstatus === 'Hospitalized') {
//       currentDistrict.active++;
//     } else if(row.currentstatus === 'Deceased') {
//       currentDistrict.deaths++;
//     } else if(row.currentstatus === 'Recovered') {
//       currentDistrict.recovered++;
//     }

    return acc;
  
  }, {});

  let stateDistrictWiseDataV2 = Object.keys(StateDistrictWiseData).map(state => {
    let districtData = StateDistrictWiseData[state].districtData;
    return {
      state,
      districtData: Object.keys(districtData).map(district => {
        return { district, ...districtData[district] };
      })
    }
  });

  fs.writeFileSync(DIR + 'state_district_wise.json', JSON.stringify(StateDistrictWiseData, null, 2));
  fs.writeFileSync(DIR + 'v2/state_district_wise.json', JSON.stringify(stateDistrictWiseDataV2, null, 2));
  console.log('Starting district wise data processing ...done');
} catch(err) {
  console.log('Error processing district wise data', err);
}

