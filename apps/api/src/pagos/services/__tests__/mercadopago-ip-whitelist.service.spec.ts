import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoIpWhitelistService } from '../mercadopago-ip-whitelist.service';

describe('MercadoPagoIpWhitelistService', () => {
  let service: MercadoPagoIpWhitelistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MercadoPagoIpWhitelistService],
    }).compile();

    service = module.get<MercadoPagoIpWhitelistService>(
      MercadoPagoIpWhitelistService,
    );
  });

  describe('isIpAllowed', () => {
    describe('MercadoPago Official IP Ranges', () => {
      it('should_allow_ip_from_mercadopago_primary_range_209_225_49_x', () => {
        expect(service.isIpAllowed('209.225.49.1')).toBe(true);
        expect(service.isIpAllowed('209.225.49.100')).toBe(true);
        expect(service.isIpAllowed('209.225.49.255')).toBe(true);
      });

      it('should_allow_ip_from_mercadopago_secondary_range_216_33_197_x', () => {
        expect(service.isIpAllowed('216.33.197.1')).toBe(true);
        expect(service.isIpAllowed('216.33.197.128')).toBe(true);
        expect(service.isIpAllowed('216.33.197.255')).toBe(true);
      });

      it('should_allow_ip_from_mercadopago_tertiary_range_216_33_196_x', () => {
        expect(service.isIpAllowed('216.33.196.0')).toBe(true);
        expect(service.isIpAllowed('216.33.196.50')).toBe(true);
        expect(service.isIpAllowed('216.33.196.255')).toBe(true);
      });

      it('should_allow_ip_from_mercadopago_testing_range_63_128_82_x', () => {
        expect(service.isIpAllowed('63.128.82.1')).toBe(true);
        expect(service.isIpAllowed('63.128.83.100')).toBe(true);
        expect(service.isIpAllowed('63.128.94.200')).toBe(true);
      });

      it('should_allow_ip_from_gcp_range_35_186_x_x', () => {
        expect(service.isIpAllowed('35.186.0.1')).toBe(true);
        expect(service.isIpAllowed('35.186.100.50')).toBe(true);
        expect(service.isIpAllowed('35.186.255.255')).toBe(true);
      });

      it('should_allow_ip_from_gcp_range_35_245_x_x', () => {
        expect(service.isIpAllowed('35.245.0.1')).toBe(true);
        expect(service.isIpAllowed('35.245.128.64')).toBe(true);
        expect(service.isIpAllowed('35.245.255.255')).toBe(true);
      });
    });

    describe('Unauthorized IPs', () => {
      it('should_reject_ip_outside_all_allowed_ranges', () => {
        expect(service.isIpAllowed('8.8.8.8')).toBe(false);
        expect(service.isIpAllowed('1.2.3.4')).toBe(false);
        expect(service.isIpAllowed('192.168.1.1')).toBe(false);
        expect(service.isIpAllowed('10.0.0.1')).toBe(false);
      });

      it('should_reject_ip_adjacent_to_allowed_range', () => {
        expect(service.isIpAllowed('209.225.48.255')).toBe(false);
        expect(service.isIpAllowed('209.225.50.0')).toBe(false);
        expect(service.isIpAllowed('216.33.195.255')).toBe(false);
        expect(service.isIpAllowed('216.33.198.0')).toBe(false);
      });

      it('should_reject_empty_ip', () => {
        expect(service.isIpAllowed('')).toBe(false);
      });

      it('should_log_warning_for_unauthorized_ip', () => {
        const warnSpy = jest.spyOn(service['logger'], 'warn');

        service.isIpAllowed('1.2.3.4');

        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('IP NO AUTORIZADA'),
        );
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('1.2.3.4'),
        );
      });
    });

    describe('Development Mode', () => {
      it('should_allow_localhost_127_0_0_1_in_development_mode', () => {
        expect(service.isIpAllowed('127.0.0.1', true)).toBe(true);
      });

      it('should_allow_ipv6_localhost_in_development_mode', () => {
        expect(service.isIpAllowed('::1', true)).toBe(true);
      });

      it('should_allow_ipv4_mapped_ipv6_localhost_in_development_mode', () => {
        expect(service.isIpAllowed('::ffff:127.0.0.1', true)).toBe(true);
      });

      it('should_not_allow_localhost_when_not_in_development_mode', () => {
        expect(service.isIpAllowed('127.0.0.1', false)).toBe(false);
        expect(service.isIpAllowed('::1', false)).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should_handle_boundary_ips_in_cidr_range', () => {
        expect(service.isIpAllowed('209.225.49.0')).toBe(true);
        expect(service.isIpAllowed('209.225.49.255')).toBe(true);
      });

      it('should_handle_malformed_ip_gracefully', () => {
        expect(service.isIpAllowed('not-an-ip')).toBe(false);
        expect(service.isIpAllowed('256.256.256.256')).toBe(false);
      });
    });
  });

  describe('extractRealIp', () => {
    it('should_extract_ip_from_x_forwarded_for_header', () => {
      const headers = {
        'x-forwarded-for': '209.225.49.100, 10.0.0.1, 172.16.0.1',
      };

      const ip = service.extractRealIp(headers, '127.0.0.1');

      expect(ip).toBe('209.225.49.100');
    });

    it('should_handle_single_ip_in_x_forwarded_for', () => {
      const headers = {
        'x-forwarded-for': '209.225.49.50',
      };

      const ip = service.extractRealIp(headers, '127.0.0.1');

      expect(ip).toBe('209.225.49.50');
    });

    it('should_trim_whitespace_from_x_forwarded_for', () => {
      const headers = {
        'x-forwarded-for': '  209.225.49.100  , 10.0.0.1',
      };

      const ip = service.extractRealIp(headers, '127.0.0.1');

      expect(ip).toBe('209.225.49.100');
    });

    it('should_fallback_to_x_real_ip_when_no_x_forwarded_for', () => {
      const headers = {
        'x-real-ip': '216.33.197.50',
      };

      const ip = service.extractRealIp(headers, '127.0.0.1');

      expect(ip).toBe('216.33.197.50');
    });

    it('should_fallback_to_socket_ip_when_no_headers', () => {
      const headers = {};

      const ip = service.extractRealIp(headers, '192.168.1.100');

      expect(ip).toBe('192.168.1.100');
    });

    it('should_return_localhost_when_no_ip_available', () => {
      const headers = {};

      const ip = service.extractRealIp(headers);

      expect(ip).toBe('127.0.0.1');
    });

    it('should_handle_array_x_forwarded_for_header', () => {
      const headers = {
        'x-forwarded-for': ['209.225.49.100, 10.0.0.1', '172.16.0.1'],
      };

      const ip = service.extractRealIp(headers, '127.0.0.1');

      expect(ip).toBe('209.225.49.100');
    });

    it('should_prefer_x_forwarded_for_over_x_real_ip', () => {
      const headers = {
        'x-forwarded-for': '209.225.49.100',
        'x-real-ip': '216.33.197.50',
      };

      const ip = service.extractRealIp(headers, '127.0.0.1');

      expect(ip).toBe('209.225.49.100');
    });
  });

  describe('getOfficialRanges', () => {
    it('should_return_copy_of_official_ip_ranges', () => {
      const ranges = service.getOfficialRanges();

      expect(Array.isArray(ranges)).toBe(true);
      expect(ranges.length).toBeGreaterThan(0);
      expect(ranges).toContain('209.225.49.0/24');
      expect(ranges).toContain('216.33.197.0/24');
    });

    it('should_not_allow_modification_of_internal_array', () => {
      const ranges1 = service.getOfficialRanges();
      ranges1.push('hacked.range/24');

      const ranges2 = service.getOfficialRanges();

      expect(ranges2).not.toContain('hacked.range/24');
    });
  });

  describe('getValidationStats', () => {
    it('should_return_count_of_official_ranges_and_additional_ips', () => {
      const stats = service.getValidationStats();

      expect(stats.officialRangesCount).toBeGreaterThan(0);
      expect(stats.additionalIpsCount).toBeGreaterThan(0);
      expect(typeof stats.officialRangesCount).toBe('number');
      expect(typeof stats.additionalIpsCount).toBe('number');
    });
  });

  describe('CIDR Calculation', () => {
    it('should_correctly_calculate_cidr_24_boundaries', () => {
      expect(service.isIpAllowed('209.225.49.0')).toBe(true);
      expect(service.isIpAllowed('209.225.49.127')).toBe(true);
      expect(service.isIpAllowed('209.225.49.255')).toBe(true);

      expect(service.isIpAllowed('209.225.48.255')).toBe(false);
      expect(service.isIpAllowed('209.225.50.0')).toBe(false);
    });

    it('should_correctly_calculate_cidr_16_boundaries', () => {
      expect(service.isIpAllowed('35.186.0.0')).toBe(true);
      expect(service.isIpAllowed('35.186.128.128')).toBe(true);
      expect(service.isIpAllowed('35.186.255.255')).toBe(true);

      expect(service.isIpAllowed('35.185.255.255')).toBe(false);
      expect(service.isIpAllowed('35.187.0.0')).toBe(false);
    });
  });
});
