import React from "react";
import '../VaultComponents/vaultStyle.css';
import { HiOutlineLockClosed } from 'react-icons/hi';
import { MdCheckCircle } from 'react-icons/md';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { List, ListItem, Text, ListIcon, Heading, VStack, Avatar, HStack, IconButton, Link } from "@chakra-ui/react";
import ReportIssueForm from "../CommonComponents/ReportIssueForm";

const About = () => {
    const year = new Date().getFullYear();

    return(
        <div className='parent-container'>
            <div className='top-header'>
                <div>
                    <HiOutlineLockClosed size={24} color='#2daaff'/>
                    <h1>DataVault</h1>
                </div>
            </div>

            <div className='about-grid'>
                <div style={{padding: '0 20px 20px 20px'}}>
                    <Heading size='md' mb={3} mt={0}>Overview</Heading>
                    <Text color='gray.300'>
                        DataVault is a personal data management application designed to help you securely store your necessary personal information at one place. The goal is to provide a privacy-focused
                        platform which stores your data with strict encryption which cannot be decrypted without your password and security pin.
                        In case you forget your password or security pin, you can reset it, but you need to remember either of them in case of recovery. If you lose both the password and security pin, data recovery is not possible.
                    </Text>

                    <Heading size='md' mb={3} mt={5}>Features</Heading>
                    <List spacing={1} color='gray.300'>
                        <ListItem>
                            <ListIcon as={MdCheckCircle} color='#2daaff' />
                            Double layer security by password and security pin.
                        </ListItem>
                        <ListItem>
                            <ListIcon as={MdCheckCircle} color='#2daaff' />
                            Password Vault to store passwords with labels.
                        </ListItem>
                        <ListItem>
                            <ListIcon as={MdCheckCircle} color='#2daaff' />
                            Expenses Vault to store expenses with trackers.
                        </ListItem>
                        <ListItem>
                            <ListIcon as={MdCheckCircle} color='#2daaff' />
                            Task Vault to store tasks.
                        </ListItem>
                        <ListItem>
                            <ListIcon as={MdCheckCircle} color='#2daaff' />
                            Notes Vault to store notes.
                        </ListItem>
                        <ListItem>
                            <ListIcon as={MdCheckCircle} color='#2daaff' />
                            Various settings for hiding critical buttons and details.
                        </ListItem>
                        <ListItem>
                            <ListIcon as={MdCheckCircle} color='#2daaff' />
                            Recovery possible in cases of losing either of the password or security pin.
                        </ListItem>
                    </List>

                    <Heading size='md' mb={3} mt={5}>Privacy and Security</Heading>
                    <Text color='gray.300'>
                        This application stores almost all your data in encrypted format where the decryption is only possible when user enters the password and security pin.
                        But still certain fields remain non encrypted for the proper functionality and performance of the application. This include:
                    </Text>
                    <List spacing={1} color='gray.300' my={2}>
                        <ListItem>
                            <ListIcon as={MdCheckCircle} color='#2daaff' />
                            The settings of user with true/false values. 
                        </ListItem>
                        <ListItem>
                            <ListIcon as={MdCheckCircle} color='#2daaff' />
                            Start and end dates of every task (not the task name and status).
                        </ListItem>
                        <ListItem>
                            <ListIcon as={MdCheckCircle} color='#2daaff' />
                            Profile details fields email and name.
                        </ListItem>
                    </List>
                    <Text color='gray.300'>
                        The above fields are not sensitive and capable to reveal any of your data but still for privacy purposes, please avoid storing any sensitive data in the above fields.<br/>
                        There are strict security checks at every step to prevent unauthorized access. But in case you find an unauthorized access, you can block access to your account by contacting the
                        admin using the form given here.
                    </Text>

                    <Heading size='md' mb={3} mt={5}>Meet the Creator</Heading>
                    <VStack spacing={3} mt={5}>
                        <Avatar size="xl" name="Devanshu Lanjudkar" />
                        <Text fontWeight="bold">Devanshu Lanjudkar</Text>
                        <HStack spacing={4}>
                            <Link href="https://github.com/git-devanshu" isExternal>
                                <IconButton icon={<FaGithub size="24px" color="#000"/>} variant="ghost" _hover={{backgroundColor: '#121826'}} aria-label="GitHub" />
                            </Link>
                            <Link href="https://www.linkedin.com/in/devanshu-lanjudkar-b3220a289/" isExternal>
                                <IconButton icon={<FaLinkedin size="24px" color="#0A66C2"/>} variant="ghost" _hover={{backgroundColor: '#121826'}} aria-label="LinkedIn" />
                            </Link>
                        </HStack>
                    </VStack>

                    <footer style={{ fontSize: "14px", textAlign: "center", color: "#666", marginTop: '20px' }}>
                       ©{year} DataVault.
                    </footer>
                </div>

                <div style={{padding: '0 20px 20px 20px'}}>
                    <ReportIssueForm />
                </div>
            </div>
        </div>
    );
};

export default About;
