import React from 'react'
import '../CommonComponents/commonStyle.css';
import { CloseButton, Spacer, Stack, Text, Stat, StatNumber, StatHelpText, StatGroup, Progress, Heading } from '@chakra-ui/react';
import {
    FaUtensils,        // Food & Groceries
    FaBus,             // Transport
    FaBook,            // Education
    FaFileInvoiceDollar,            // Bills & Rent
    FaHeartbeat,       // Health
    FaFilm,            // Entertainment
    FaShoppingBag,     // Shopping
    FaChartLine,       // Investment
    FaFolderOpen,      // Other
} from "react-icons/fa";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
  
ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseAnalyticsPopup({data, trackingAmount, setShowPopup, trackerName}) {
    const totalSpent = !data?.length ? 0 : data.reduce((sum, item) => sum + parseInt(item.amount, 10), 0);
    const percentage = Math.min((totalSpent / parseInt(trackingAmount)) * 100, 100).toFixed(2);
    const remaining = trackerName === "Other" ? 0 : trackingAmount - totalSpent; 

    const categoryTotals = data.reduce((acc, item) => {
        const cat = item.category;
        acc[cat] = (acc[cat] || 0) + Number(item.amount);
        return acc;
    }, {});

    const donutData = {
        labels: ['Spent', 'Remaining'],
        datasets: [
            {
                data: [totalSpent, remaining],
                backgroundColor: ['orange', '#22c55e'], // spent, remaining
                borderWidth: 0,
            },
        ],
    };
    
    const options = {
        circumference: 200,
        rotation: 260,
        plugins: {
            legend: { display: false }, // hide labels
            tooltip: { enabled: true }, // show on hover
        },
        cutout: '75%', // donut thickness
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case "food & groceries":
                return <FaUtensils />;
            case "transport":
                return <FaBus />;
            case "education":
                return <FaBook />;
            case "bills & rent":
                return <FaFileInvoiceDollar />;
            case "health":
                return <FaHeartbeat />;
            case "entertainment":
                return <FaFilm />;
            case "shopping":
                return <FaShoppingBag />;
            case "investment":
                return <FaChartLine />;
            case "other":
            default:
                return <FaFolderOpen />;
        }
    };
    
    return (
        <div className='popup-container' style={{padding: '0', height: '90%', top: '5%', overflowY: 'scroll', scrollbarWidth: "none"}} >
            <div style={{padding: '10px', backgroundColor: '#121826', borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}>
                <Stack direction='row' alignItems='center' mb={5}>
                    <Text fontSize='xl' ml={1}>{trackerName}</Text>
                    <Spacer/>
                    <CloseButton title='close' onClick={()=>setShowPopup(false)}/>
                </Stack>

                <div style={{width: '100px', height: '100px', margin: '0 auto'}}>
                    <Doughnut data={donutData} options={options} />
                </div>
                <Heading textAlign='center' mt={-5} mb={5}>{totalSpent}</Heading>
                
                <StatGroup>
                    <Stat>
                        <StatNumber color='#22c55e' fontSize='20px' textAlign='center'>{remaining}</StatNumber>
                        <StatHelpText textAlign='center'>Remaining</StatHelpText>
                    </Stat>
                    <Stat>
                        <StatNumber color='#2daaff' fontSize='20px' textAlign='center'>{trackingAmount}</StatNumber>
                        <StatHelpText textAlign='center'>Total Amount</StatHelpText>
                    </Stat>
                </StatGroup>

                <Progress title={`Spent ${percentage}%`} value={percentage} colorScheme='gray' size='sm' mx={3} mt={3} borderRadius='10px'/>
                <Text fontSize='sm' color='orange' textAlign='center' mt={1}>Total Spent {percentage}%</Text>
            </div>
            
            <div style={{padding: '10px'}}>
                <Text textAlign='center' mb={4} mt={1}>Expenses Overivew</Text>
                
                {Object.entries(categoryTotals).map(([category, total]) => (
                    <div key={category} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', backgroundColor: '#222b3e', borderRadius: '8px'}}>
                        <div style={{padding: '12px', color: '#dddddd', fontSize: '20px', backgroundColor: '#121826', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px'}}>
                            {getCategoryIcon(category)}
                        </div>

                        <Text style={{ flex: 1, textTransform: 'capitalize', margin: '10px' }}>{category}</Text>
                        <strong style={{margin: '10px'}}>{total}</strong>
                    </div>
                ))}

            </div>
        </div>
    );
}
