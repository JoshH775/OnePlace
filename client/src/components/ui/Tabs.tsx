import { Tab, TabGroup, TabList, TabPanel as HeadlessTabPanel, TabPanels } from "@headlessui/react";
import { useState } from "react";

type Props = {
    children: React.ReactNode;
    tabs: string[];
    selectedTab?: number;
    className?: string;
    onTabChange?: (index: number) => void;
}

export function TabPanel({children, className}: {children: React.ReactNode, className?: string}) {
    return (
        <HeadlessTabPanel className={`w-full` + (className ? ` ${className}` : '')}>
            {children}
        </HeadlessTabPanel>
    )
}

export function Tabs({children, tabs, selectedTab = 0, onTabChange, className = ''}: Props) {
    const [selectedTabIndex, setSelectedTabIndex] = useState(selectedTab);

    const onChange = (index: number) => {
        setSelectedTabIndex(index);
        if (onTabChange) {
            onTabChange(index);
        }
    }

    return (
        <TabGroup selectedIndex={selectedTabIndex} onChange={onChange} className={`w-full shadow-xl dark:shadow:none  dark:bg-onyx-light rounded-md p-2 pt-0 ${className}`}>
            <TabList className="flex justify-center items-center rounded-md mb-4 p-1">
                {tabs.map((tab, index) => (
                    <Tab key={index} className="cursor-pointer w-1/2 p-2 data-[selected]:border-b-2 data-[selected]:border-indigo font-semibold">{tab}</Tab>
                ))}
            </TabList>
            <TabPanels>
                {children}
            </TabPanels>
        </TabGroup>
    )
}