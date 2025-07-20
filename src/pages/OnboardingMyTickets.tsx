import TicketList from '../components/TicketList';
import { SupportTicket } from '@/types/support';

const OnboardingMyTickets = () => {
  const handleTicketSelect = (ticket: SupportTicket) => {
    console.log('Selected ticket:', ticket);
  };

  return <TicketList onTicketSelect={handleTicketSelect} />;
};

export default OnboardingMyTickets; 