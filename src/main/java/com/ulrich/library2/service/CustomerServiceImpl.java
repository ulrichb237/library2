package com.ulrich.library2.service;


import com.ulrich.library2.entity.customer.Customer;
import com.ulrich.library2.repository.ICustomerDao;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("customerService")
@Transactional
public class CustomerServiceImpl implements ICustomerService {

    private ICustomerDao customerDao;

    public CustomerServiceImpl(ICustomerDao customerDao) {
        this.customerDao = customerDao;
    }

    @Override
    public Customer saveCustomer(Customer customer) {
        return customerDao.save(customer);
    }

    @Override
    public Customer updateCustomer(Customer customer) {
        return customerDao.save(customer);
    }

    @Override
    public void deleteCustomer(Integer customerId) {
        customerDao.deleteById(customerId);
    }

    @Override
    public boolean checkIfIdexists(Integer id) {
        return customerDao.existsById(id);
    }

    @Override
    public Customer findCustomerByEmail(String email) {
        return customerDao.findCustomerByEmailIgnoreCase(email);
    }

    public Customer findCustomerById(Integer customerId) {
        return customerDao.getOne(customerId);
    }

    @Override
    public Page<Customer> getPaginatedCustomersList(int begin, int end){
        Pageable page = PageRequest.of(begin, end);
        return customerDao.findAll(page);
    }

    @Override
    public List<Customer> findCustomerByLastName(String lastName){
        return customerDao.findCustomerByLastNameIgnoreCase(lastName);
    }

}


