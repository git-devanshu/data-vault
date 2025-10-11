import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Text } from '@chakra-ui/react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TaskStatusDonut({ tasks, hideCompletedTasks }) {
    const statusCounts = tasks.reduce(
        (acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {}
    );

    const halfData = {
        labels: ['Pending', 'In Progress'],
        datasets: [
            {
                label: 'Tasks',
                data: [
                    statusCounts['pending'] || 0,
                    statusCounts['in progress'] || 0,
                ],
                backgroundColor: ['orange', '#2daaff'], // orange, blue,
                borderWidth: 1,
            },
        ],
    };

    const fullData = {
        labels: ['Pending', 'In Progress', 'Completed'],
        datasets: [
            {
                label: 'Tasks',
                data: [
                    statusCounts['pending'] || 0,
                    statusCounts['in progress'] || 0,
                    statusCounts['completed'] || 0,
                ],
                backgroundColor: ['orange', '#2daaff', '#22c55e'], // orange, blue, green
                borderWidth: 1,
            },
        ],
    };

    const options = {
        cutout: '65%',
        plugins: {
            legend: {display: false},
            tooltip: {enabled: true},
        },
    };

    if(!tasks?.length){
        return <Text color='gray.400' textAlign='center' mb={5}>No analytics available for this month.</Text>
    }

    return (
        <div style={{ width: '200px', height: '200px', margin: '0 auto' }}>
            <Doughnut data={hideCompletedTasks ? halfData : fullData} options={options}/>
        </div>
    );
}
