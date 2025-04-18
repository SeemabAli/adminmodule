/* eslint-disable react-refresh/only-export-components */
import type { FC, ReactNode } from "react";
import { Link } from "react-router";
import {
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  HomeModernIcon,
  BuildingLibraryIcon,
  MegaphoneIcon,
  Squares2X2Icon,
  UserGroupIcon,
  UserIcon,
  UserPlusIcon,
  BellIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

interface SidebarItem {
  Icon: ReactNode;
  Label: string;
  Link: string;
}

interface SidebarGroup {
  Group: string | null;
  expanded: boolean;
  Items: SidebarItem[];
}

export const SidebarItemsData: SidebarGroup[] = [
  {
    Group: null,
    expanded: true,
    Items: [
      {
        Icon: <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2" />,
        Label: "Onboarding",
        Link: "/onboarding",
      },
      {
        Icon: <Squares2X2Icon className="h-6 w-6 mr-2" />,
        Label: "Dashboard",
        Link: "/dashboard",
      },
    ],
  },
  {
    Group: "ACADEMIC",
    expanded: true,
    Items: [
      {
        Icon: <CalendarIcon className="h-6 w-6 mr-2" />,
        Label: "Schedule",
        Link: "/schedule",
      },
      {
        Icon: <AcademicCapIcon className="h-6 w-6 mr-2" />,
        Label: "Exam Board",
        Link: "/exam-board",
      },
      {
        Icon: <BookOpenIcon className="h-6 w-6 mr-2" />,
        Label: "Homeworks",
        Link: "/diary",
      },
      {
        Icon: <ChartBarIcon className="h-6 w-6 mr-2" />,
        Label: "Grade Report",
        Link: "/exams-details",
      },
      {
        Icon: <DocumentTextIcon className="h-6 w-6 mr-2" />,
        Label: "Enrolled Courses",
        Link: "/enrolled-courses",
      },
      {
        Icon: <AcademicCapIcon className="h-6 w-6 mr-2" />,
        Label: "Subjects",
        Link: "/subject",
      },
      {
        Icon: <ClockIcon className="h-6 w-6 mr-2" />,
        Label: "Attendance",
        Link: "/attendance",
      },
      {
        Icon: <BuildingLibraryIcon className="h-6 w-6 mr-2" />,
        Label: "Libraries",
        Link: "/libraries",
      },
    ],
  },
  {
    Group: "ADMINISTRATOR",
    expanded: true,
    Items: [
      {
        Icon: <UserPlusIcon className="h-6 w-6 mr-2" />,
        Label: "Admission",
        Link: "/admission",
      },
      {
        Icon: <UserGroupIcon className="h-6 w-6 mr-2" />,
        Label: "Students",
        Link: "/students",
      },
      {
        Icon: <UserIcon className="h-6 w-6 mr-2" />,
        Label: "Staff",
        Link: "/staff",
      },
      {
        Icon: <HomeModernIcon className="h-6 w-6 mr-2" />,
        Label: "Class",
        Link: "/class",
      },
      {
        Icon: <CreditCardIcon className="h-6 w-6 mr-2" />,
        Label: "Finance",
        Link: "/finance",
      },
      {
        Icon: <MegaphoneIcon className="h-6 w-6 mr-2" />,
        Label: "Announcements",
        Link: "/announcements",
      },
    ],
  },
  {
    Group: "SETTINGS",
    expanded: true,
    Items: [
      {
        Icon: <Cog6ToothIcon className="h-6 w-6 mr-2" />,
        Label: "Account Settings",
        Link: "/account-settings",
      },
      {
        Icon: <BellIcon className="h-6 w-6 mr-2" />,
        Label: "Notification Preferences",
        Link: "/notification-preferences",
      },
    ],
  },
];

const Sidebar: FC = () => {
  return (
    <aside className="w-64 h-screen bg-base-100 text-base-content shadow-lg">
      <div className="h-full px-4 py-5 overflow-y-auto">
        <ul className="space-y-2 text-sm">
          {SidebarItemsData.map((group, groupIndex) => (
            <li key={groupIndex}>
              {group.Group && (
                <div className="text-xs text-base-content/60 uppercase tracking-wide mt-4 mb-2 pl-2">
                  {group.Group}
                </div>
              )}
              {group.Items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.Link}
                  className="flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-base-200 active:bg-base-300"
                >
                  {item.Icon}
                  <span className="ml-1">{item.Label}</span>
                </Link>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
