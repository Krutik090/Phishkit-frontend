import React from 'react';
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu
} from 'react-pro-sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaUserShield,
  FaUsers,
  FaUser,
  FaUserTag,
  FaKey,
  FaCog,
  FaDatabase,
  FaRocket,
  FaFolder,
  FaQuestionCircle,
  FaChalkboardTeacher,
  FaPaperPlane,
  FaFileAlt,
  FaUserFriends,
  FaFile,
  FaProjectDiagram,
  FaCogs,
  FaTachometerAlt
} from 'react-icons/fa';

const S_Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Sidebar breakPoint="md" backgroundColor="#151529" style={{ height: '100vh' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px 16px',
        borderBottom: '1px solid #2d2d3f',
        backgroundColor: '#1f1f33',
        gap: '12px'
      }}>
        <img
          src="/Triabation_Logo.png"
          alt="Tribastion Logo"
          style={{ height: '28px', width: '28px' }}
        />
        <span style={{
          color: '#ec008c',
          fontWeight: 'bold',
          fontSize: '21px',
          letterSpacing: '1px',
          marginLeft: '20px'
        }}>
          Tribastion
        </span>
      </div>

      <Menu
        iconShape="circle"
        menuItemStyles={{
          button: ({ active, level }) => ({
            backgroundColor: active ? '#8C3061' : 'transparent',
            color: '#ffffff',
            paddingLeft: level === 0 ? '20px' : '40px',
            fontSize: level === 0 ? '15px' : '14px',
            '&:hover': {
              backgroundColor: '#8C3061',
              color: '#ffffff',
            },
          }),
          icon: {
            color: '#ec008c',
          },
          label: {
            color: '#ffffff',
          },
          subMenuContent: {
            backgroundColor: '#1d1d2f',
            paddingTop: '4px',
            paddingBottom: '4px',
          },
          rootSubMenuContent: {
            backgroundColor: '#1d1d2f',
          },
          expandIcon: {
            color: '#ec008c',
          }
        }}
      >

        {/* Admin Dashboard */}
        <MenuItem
          icon={<FaTachometerAlt />}
          active={isActive('/super-admin/admin-dashboard')}
          onClick={() => navigate('/super-admin/admin-dashboard')}
        >
          Admin Dashboard
        </MenuItem>

        {/* Super Admin Section */}
        <SubMenu
          label="Super Admin"
          icon={<FaUserShield />}
          defaultOpen={
            location.pathname.startsWith('/super-admin/admins') ||
            location.pathname.startsWith('/super-admin/logs') ||
            location.pathname.startsWith('/super-admin/users') ||
            location.pathname.startsWith('/super-admin/roles') ||
            location.pathname.startsWith('/super-admin/permissions')
          }
        >
          <MenuItem
            icon={<FaUserShield />}
            active={isActive('/super-admin/admins')}
            onClick={() => navigate('/super-admin/admins')}
          >
            Admins
          </MenuItem>
          <MenuItem
            icon={<FaDatabase />}
            active={isActive('/super-admin/logs')}
            onClick={() => navigate('/super-admin/logs')}
          >
            Logs
          </MenuItem>
          <SubMenu
            label="User Management"
            icon={<FaUsers />}
            defaultOpen={
              location.pathname.startsWith('/super-admin/users') ||
              location.pathname.startsWith('/super-admin/roles') ||
              location.pathname.startsWith('/super-admin/permissions')
            }
          >
            <MenuItem
              icon={<FaUser />}
              active={isActive('/super-admin/users')}
              onClick={() => navigate('/super-admin/users')}
            >
              All Users
            </MenuItem>
            <MenuItem
              icon={<FaUserTag />}
              active={isActive('/super-admin/roles')}
              onClick={() => navigate('/super-admin/roles')}
            >
              Roles
            </MenuItem>
            <MenuItem
              icon={<FaKey />}
              active={isActive('/super-admin/permissions')}
              onClick={() => navigate('/super-admin/permissions')}
            >
              Permissions
            </MenuItem>
          </SubMenu>
        </SubMenu>

        {/* General Section */}
        <SubMenu
          label="General"
          icon={<FaCog />}
          defaultOpen={
            location.pathname.startsWith('/super-admin/dashboard') ||
            location.pathname.startsWith('/super-admin/campaign') ||
            location.pathname.startsWith('/super-admin/template') ||
            location.pathname.startsWith('/super-admin/landing-page') ||
            location.pathname.startsWith('/super-admin/sending-profile') ||
            location.pathname.startsWith('/super-admin/users-groups')
          }
        >
          <MenuItem
            icon={<FaRocket />}
            active={isActive('/super-admin/dashboard')}
            onClick={() => navigate('/super-admin/dashboard')}
          >
            Dashboard
          </MenuItem>
          <MenuItem
            icon={<FaPaperPlane />}
            active={isActive('/super-admin/campaign')}
            onClick={() => navigate('/super-admin/campaign')}
          >
            Campaign
          </MenuItem>
          <MenuItem
            icon={<FaFileAlt />}
            active={isActive('/super-admin/template')}
            onClick={() => navigate('/super-admin/template')}
          >
            Template
          </MenuItem>
          <MenuItem
            icon={<FaFile />}
            active={isActive('/super-admin/landing-page')}
            onClick={() => navigate('/super-admin/landing-page')}
          >
            Landing Page
          </MenuItem>
          <MenuItem
            icon={<FaPaperPlane />}
            active={isActive('/super-admin/sending-profile')}
            onClick={() => navigate('/super-admin/sending-profile')}
          >
            Sending Profile
          </MenuItem>
          <MenuItem
            icon={<FaUserFriends />}
            active={isActive('/super-admin/users-groups')}
            onClick={() => navigate('/super-admin/users-groups')}
          >
            Users & Groups
          </MenuItem>
        </SubMenu>

        {/* Extra Section */}
        <SubMenu
          label="Extra"
          icon={<FaFolder />}
          defaultOpen={
            location.pathname.startsWith('/super-admin/project') ||
            location.pathname.startsWith('/super-admin/quiz') ||
            location.pathname.startsWith('/super-admin/training')
          }
        >
          <MenuItem
            icon={<FaProjectDiagram />}
            active={isActive('/super-admin/project')}
            onClick={() => navigate('/super-admin/project')}
          >
            Project
          </MenuItem>
          <MenuItem
            icon={<FaQuestionCircle />}
            active={isActive('/super-admin/quiz')}
            onClick={() => navigate('/super-admin/quiz')}
          >
            Quiz
          </MenuItem>
          <MenuItem
            icon={<FaChalkboardTeacher />}
            active={isActive('/super-admin/training')}
            onClick={() => navigate('/super-admin/training')}
          >
            Training
          </MenuItem>
        </SubMenu>

        {/* Settings */}
        <MenuItem
          icon={<FaCogs />}
          active={isActive('/super-admin/settings')}
          onClick={() => navigate('/super-admin/settings')}
        >
          Settings
        </MenuItem>
      </Menu>
    </Sidebar>
  );
};

export default S_Sidebar;
