import React, { useRef, useState } from 'react'
import '../CommonComponents/commonStyle.css';
import { useAppContext } from '../context/AppContext';
import { CloseButton, Spacer, Stack, Text, IconButton, TableContainer, Table, Thead, Tbody, Tr, Th, Td, Checkbox, Badge, ButtonGroup, Button } from '@chakra-ui/react';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { RiArrowTurnForwardFill } from "react-icons/ri";
import { BiSolidDownload } from "react-icons/bi";
import { RiFileTransferLine } from "react-icons/ri";
import axios from 'axios';
import toast from 'react-hot-toast';
import { primaryAPIVersion, getAuthToken, getBaseURL } from '../utils/helperFunctions';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function TransferExpensePopup({setShowPopup, filtered, fromTracker, fromTrackerIndex}) {
    const {trackers} = useAppContext();

    const [toTrackerIndex, setToTrackerIndex] = useState(-1);
    const [selectedRows, setSelectedRows] = useState(new Set());

    const [isLoading, setIsLoading] = useState(false);

    const tableRef = useRef();

    const handleRowSelect = (id) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if(newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if(selectedRows.size === filtered.length) setSelectedRows(new Set());
        else setSelectedRows(new Set(filtered.map(item => item.id)));
    };


    const transferExpense = async(e) =>{
        e.preventDefault();
        if(toTrackerIndex < 0 || selectedRows?.length === 0) {
            toast.error('cannot transfer expenses');
            return;
        }
        if(toTrackerIndex == fromTrackerIndex) {
            toast.error('cannot transfer to same tracker');
            return;
        }

        const token = getAuthToken();
        const toastId = toast.loading('deleting expense...');
        setIsLoading(true);

        const expenseIDsArray = [...selectedRows];

        axios.put(getBaseURL() + '/api/expense/v1/transfer', {expenseIDsArray, toTrackerIndex, fromTrackerIndex}, {headers : {
            Authorization : `Bearer ${token}`
        }})
        .then(res =>{
            if(res.status === 200){
                toast.success(res.data?.message, {id : toastId});
                setShowPopup(false);
            }
            setIsLoading(false);
        })
        .catch(err =>{
            console.log(err);
            toast.error(err.response?.data?.message || "an error occurred", {id : toastId});
            setIsLoading(false);
        });
    }


    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const columns = ["Amount", "Spent At", "Date"];

        const rows = filtered
        .filter(item => selectedRows.has(item.id))
        .map(item => [ item.amount, item.spentAt, item.spentDate ]);

        // total calculation depends on order of columns
        const total = rows.reduce((sum, row) => sum + Number(row[0]), 0);
        rows.push([ `${total}`, "Total", "" ]);
    
        autoTable(doc, {
            head: [columns],
            body: rows,
            theme: "grid",
            styles: {
                fontSize: 10,
                cellPadding: 3,
                textColor: [0, 0, 0],
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: "bold"
            },
            margin: { top: 10 }
        });
      
        doc.save(`${fromTracker}_expense_list.pdf`);
    };


    return (
        <>
        <div className='popup-container' style={{height: '100vh', width: '100%', top: '0', left: '0', overflowY: 'scroll', scrollbarWidth: "none", borderRadius: '0', maxHeight: '100vh'}}>
            <Stack direction='row' alignItems='center' mb={5}>
                <Text fontSize='xl' fontWeight={600} ml={1}>Transfer Expenses</Text>
                <IconButton title='transfer expenses from one tracker to another' icon={<QuestionOutlineIcon w={5} h={5} color='white'/>} border='none' background='transparent' _hover={{bgColor: 'transparent'}}/>
                <Spacer/>
                <CloseButton title='close' color='white' onClick={()=> setShowPopup(false)}/>
            </Stack>

            {/* from and to tracker names */}
            <div style={{width: '330px', display: 'grid', gridTemplateColumns: '90px 220px', gap: '10px', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{padding: 0, color: '#888888', fontSize: '90px', transform: 'rotate(90deg) scaleX(1.1)'}}>
                    <RiArrowTurnForwardFill style={{marginLeft: 0}}/>
                </div>
                <div>
                    <label className="login-label">Transfer from tracker</label>
                    <input type="text" name='fromTracker' value={fromTracker} readOnly={true} className="login-input" style={{height: '40px', width: '220px'}}/>

                    <label className="login-label">Transfer to tracker</label>
                    <select className="login-input" name='toTrackerIndex' value={toTrackerIndex} onChange={(e)=> {setToTrackerIndex(e.target.value);}} style={{height: '40px', width: '220px'}}>
                        <option value="">-- None --</option>
                        {trackers.map((tracker, index) => {
                            if(tracker.isRemoved) return null;
                            return(
                                <option key={index} value={index}>{tracker.trackerName + " → " + tracker.trackingAmount}</option>
                            )
                        })}
                    </select>
                </div>
            </div>

            <Text fontSize='18px' mb={4} mt={6} textAlign='left' fontWeight={500}>Expenses to transfer : <Badge>{Array.from(selectedRows)?.length}</Badge></Text>

            {(filtered?.length === 0) && <Text color='#aaaaaa' mt={8} textAlign='center'>No Expenses Available.</Text>}
            {filtered?.length > 0 && (
                <TableContainer ref={tableRef} border="1px solid" borderColor="gray.700" borderRadius="6px" sx={{'&::-webkit-scrollbar':{display:'none'}, scrollbarWidth:'none', msOverflowStyle:'none'}}>
                    <Table variant="unstyled" size="sm">
                        <Thead bg="#222b3e">
                            <Tr>
                                <Th px="3" py="3">
                                    <Checkbox size='md' isChecked={selectedRows.size === filtered.length && filtered.length > 0} onChange={handleSelectAll} />
                                </Th>
                                <Th px="2" py="3" color="white" fontSize="13px" textTransform="uppercase" letterSpacing="0.6px">Amount</Th>
                                <Th px="2" py="3" color="white" fontSize="13px" textTransform="uppercase" letterSpacing="0.6px">Spent At</Th>
                                <Th px="2" py="3" color="white" fontSize="13px" textTransform="uppercase" letterSpacing="0.6px">Date</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filtered.map((item, ind)=>(
                                <Tr key={ind} onClick={()=> handleRowSelect(item.id)} _hover={{bg:"#222b3e"}} transition="0.2s">
                                    <Td px="3" py="2">
                                        <Checkbox size="md" isChecked={selectedRows.has(item.id)} pointerEvents="none"/>
                                    </Td>
                                    <Td px="2" py="2" fontSize="15px" fontWeight="600" color="white">{item.amount}</Td>
                                    <Td px="2" py="2" fontSize="15px" color="gray.300" maxW="140px" isTruncated>{item.spentAt}</Td>
                                    <Td px="2" py="2" fontSize="15px"><Badge px="2">{item.spentDate}</Badge></Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            )}

            <ButtonGroup mt={4}>
                <Button disabled={isLoading} onClick={handleDownloadPDF} variant='outline' color='white' _hover={{bgColor: 'transparent'}} leftIcon={<BiSolidDownload />}>Download</Button>
                <Button disabled={isLoading} onClick={transferExpense} type="submit" leftIcon={<RiFileTransferLine />}>Transfer</Button>
            </ButtonGroup>
        </div>
        </>
    );
}
